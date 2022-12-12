import { render, RenderResult } from '@testing-library/react'
import {
  ArcxAnalyticsProvider,
  ArcxAnalyticsProviderProps,
  ArcxAnalyticsSdk,
  ArcxAnalyticxContext,
  SdkConfig,
  useArcxAnalytics,
} from '../src'
import { expect } from 'chai'
import sinon from 'sinon'
import * as postRequestModule from '../src/helpers/postRequest'
import {
  ATTRIBUTION_EVENT,
  CLICK_EVENT,
  DEFAULT_SDK_CONFIG,
  FIRST_PAGE_VISIT,
  PAGE_EVENT,
  REFERRER_EVENT,
} from '../src/constants'
import React from 'react'
import {
  TEST_IDENTITY,
  TEST_JSDOM_URL,
  TEST_REFERRER,
  TEST_UTM_CAMPAIGN,
  TEST_UTM_MEDIUM,
  TEST_UTM_SOURCE,
} from './constants'
import { MockEthereum } from './MockEthereum'
import globalJsdom from 'global-jsdom'

const TEST_API_KEY = 'test-api-key'
const TRACK_PAGES_CONFIG: SdkConfig = {
  ...DEFAULT_SDK_CONFIG,
  trackPages: true,
  trackReferrer: false,
  trackUTM: false,
  trackClicks: false,
  cacheIdentity: false,
}

const TestProvider = ({
  children,
  providerOverrides,
}: {
  children?: React.ReactNode
  providerOverrides?: Partial<ArcxAnalyticsProviderProps>
}) => (
  <ArcxAnalyticsProvider apiKey={TEST_API_KEY} config={TRACK_PAGES_CONFIG} {...providerOverrides}>
    <ArcxAnalyticxContext.Consumer>
      {(sdk) => (
        <div>
          <div>Identity: {sdk?.identityId}</div>
          <div
            id="id-for-click"
            data-testid="track-click"
            className="test-classname-1 test-classname-2"
          >
            Text to click
          </div>
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
      <button onClick={() => sdk?.referrer('/test')}>fire referrer event</button>
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

describe('(int) ArcxAnalyticxProvider', () => {
  let cleanup: () => void
  let postRequestStub: sinon.SinonStub

  beforeEach(() => {
    cleanup = globalJsdom(undefined, {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })
  })

  after(() => {
    cleanup()
  })

  beforeEach(async () => {
    window.ethereum = sinon.createStubInstance(MockEthereum)

    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)

    // Stub _trackPagesChange because requestAnimationFrame throws during testing
    // To be fixed in https://github.com/arcxmoney/analytics-sdk/issues/23
    sinon.stub(ArcxAnalyticsSdk.prototype, '_trackPagesChange' as any)
  })

  afterEach(sinon.restore)

  describe('Initialization', () => {
    it('initializes the SDK', async () => {
      const screen = render(<TestProvider />)

      expect(postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/identify'))
      expect(await screen.findByText(`Identity: ${TEST_IDENTITY}`)).to.exist
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

    it('makes a FIRST_PAGE_VISIT call with the UTM parameters', async () => {
      expect(window.location.href).to.eq(TEST_JSDOM_URL)

      const screen = render(
        <TestProvider
          providerOverrides={{
            config: { trackUTM: true, trackReferrer: false, trackPages: false, trackClicks: false },
          }}
        />,
      )
      expect(await screen.findByText(`Identity: ${TEST_IDENTITY}`)).to.exist

      expect(postRequestStub.calledTwice).to.be.true
      expect(
        postRequestStub
          .getCall(0)
          .calledWithExactly(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/identify'),
      ).to.be.true
      expect(
        postRequestStub
          .getCall(1)
          .calledWithExactly(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
            identityId: TEST_IDENTITY,
            event: FIRST_PAGE_VISIT,
            attributes: {
              utm: {
                source: TEST_UTM_SOURCE,
                medium: TEST_UTM_MEDIUM,
                campaign: TEST_UTM_CAMPAIGN,
              },
            },
          }),
      ).to.be.true
    })

    describe('#trackClicks', () => {
      let screen: RenderResult

      const getClickEventBody = (elementId: string, content: string) => {
        return {
          identityId: TEST_IDENTITY,
          event: CLICK_EVENT,
          attributes: {
            elementId,
            content,
          },
        }
      }

      beforeEach(async () => {
        screen = render(
          <TestProvider
            providerOverrides={{
              config: {
                trackUTM: false,
                trackReferrer: false,
                trackPages: false,
                trackClicks: true,
              },
            }}
          />,
        )
        expect(await screen.findByText(`Identity: ${TEST_IDENTITY}`)).to.exist

        postRequestStub.resetHistory()
      })

      it('makes track clicks on element with defined classname and id', async () => {
        screen.getByTestId('track-click').click()

        expect(postRequestStub.getCall(0)).to.be.calledWithExactly(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getClickEventBody('div#id-for-click.test-classname-1.test-classname-2', 'Text to click'),
        )
      })

      it('makes track clicks on element without defined classname and id', async () => {
        screen.getByText(`Identity: ${TEST_IDENTITY}`).click()

        expect(postRequestStub.getCall(0)).to.be.calledWithExactly(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getClickEventBody('div', 'Identity: test-identity'),
        )
      })
    })
  })

  describe('#useArcxAnalytics', () => {
    let screen: RenderResult

    beforeEach(async () => {
      screen = render(<ChildTest />, { wrapper: TestProvider })
      expect(await screen.findByText(`Identity: ${TEST_IDENTITY}`)).to.exist

      postRequestStub.resetHistory()
    })

    it('posts a custom event', async () => {
      screen.getByText('fire custom event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: TEST_IDENTITY,
          event: 'test-event',
          attributes: { gm: 'gm' },
        }),
      ).to.be.true
    })

    it('posts a page event', async () => {
      screen.getByText('fire page event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: TEST_IDENTITY,
          event: PAGE_EVENT,
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
          identityId: TEST_IDENTITY,
          event: 'TRANSACTION_SUBMITTED',
          attributes: { chain: 1, transaction_hash: '0x123', metadata: {} },
        }),
      ).to.be.true
    })

    it('posts an attribute event', async () => {
      screen.getByText('fire attribute event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: TEST_IDENTITY,
          event: ATTRIBUTION_EVENT,
          attributes: { source: 'facebook', medium: 'social', campaign: 'ad-camp' },
        }),
      ).to.be.true
    })

    it('posts a referrer event', async () => {
      screen.getByText('fire referrer event').click()

      expect(
        postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/submit-event', {
          identityId: TEST_IDENTITY,
          event: REFERRER_EVENT,
          attributes: { referrer: '/test' },
        }),
      ).to.be.true
    })
  })
})
