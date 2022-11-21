import { render, screen } from '@testing-library/react'
import {
  ArcxAnalyticsProvider,
  ArcxAnalyticsProviderProps,
  ArcxAnalyticxContext,
  useArcxAnalytics,
} from '../src'
import { expect } from 'chai'
import sinon from 'sinon'
import * as postRequestModule from '../src/helpers/postRequest'
import { ATTRIBUTION_EVENT, DEFAULT_SDK_CONFIG } from '../src/constants'
import React from 'react'

const IDENTITY_ID = 'test-dentity-id'
const TEST_API_KEY = 'test-api-key'
const CONFIG = {}

const TestProvider = ({
  children,
  providerOverrides,
}: {
  children?: React.ReactNode
  providerOverrides?: ArcxAnalyticsProviderProps
}) => (
  <ArcxAnalyticsProvider
    apiKey={TEST_API_KEY}
    config={{ ...CONFIG, trackPages: false }}
    {...providerOverrides}
  >
    <ArcxAnalyticxContext.Consumer>
      {(sdk) => (
        <div>
          <div>{sdk?.identityId}</div>
          <div>{children}</div>
        </div>
      )}
    </ArcxAnalyticxContext.Consumer>
  </ArcxAnalyticsProvider>
)

const ChildTest = () => {
  const sdk = useArcxAnalytics()

  return (
    <div>
      <button onClick={() => sdk?.page({ url: '/test' })}>fire page event</button>
      <button onClick={() => sdk?.event('test-event', { gm: 'gm' })}>fire custom event</button>
      <button onClick={() => sdk?.transaction({ chain: 1, transactionHash: '0x123' })}>
        fire transaction event
      </button>
      <button
        onClick={() =>
          sdk?.attribute({ source: 'facebook', medium: 'social', campaign: 'ad-camp' })
        }
      >
        fire attribute event
      </button>
    </div>
  )
}

describe('ArcxAnalyticxProvider', () => {
  let postRequestStub: sinon.SinonStub

  beforeEach(async () => {
    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(IDENTITY_ID)
    render(<ChildTest />, { wrapper: TestProvider })
    expect(await screen.findByText(IDENTITY_ID)).to.exist
    postRequestStub.resetHistory()
  })

  afterEach(sinon.restore)

  describe('Initialization', () => {
    it('initializes the SDK', async () => {
      render(<TestProvider />)

      expect(postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/identify'))
      expect(await screen.findByText(IDENTITY_ID)).to.exist
    })

    it('fails to initialize sdk if api key was not provided', () => {
      // Hide the error message in the console
      sinon.stub(console, 'error')
      expect(() => render(<TestProvider providerOverrides={{ apiKey: '' }} />)).to.throw(
        'ArcxAnalyticxProvider: No API key provided',
      )
    })

    it('does not initialize twice', async () => {
      const { rerender } = render(<TestProvider />)
      expect(postRequestStub.calledOnce).to.be.true
      postRequestStub.resetHistory()

      rerender(<TestProvider providerOverrides={{ apiKey: 'new-api-key' }} />)
      expect(postRequestStub.called).to.be.false
    })
  })

  describe('Subbmitting events', () => {
    it('posts a custom event', async () => {
      screen.getByText('fire custom event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: IDENTITY_ID,
          event: 'test-event',
          attributes: { gm: 'gm' },
        }),
      ).to.be.true
    })

    it('posts a page event', async () => {
      screen.getByText('fire page event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: IDENTITY_ID,
          event: 'PAGE',
          attributes: {
            url: '/test',
          },
        }),
      ).to.be.true
    })

    it('posts a transaction event', async () => {
      screen.getByText('fire transaction event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: IDENTITY_ID,
          event: 'TRANSACTION_SUBMITTED',
          attributes: { chain: 1, transaction_hash: '0x123', metadata: {} },
        }),
      ).to.be.true
    })

    it('posts an attribute event', async () => {
      screen.getByText('fire attribute event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: IDENTITY_ID,
          event: ATTRIBUTION_EVENT,
          attributes: { source: 'facebook', medium: 'social', campaign: 'ad-camp' },
        }),
      ).to.be.true
    })
  })
})
