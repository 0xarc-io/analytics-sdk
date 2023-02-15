import { render, RenderResult } from '@testing-library/react'
import {
  ArcxAnalyticsProvider,
  ArcxAnalyticsProviderProps,
  ArcxAnalyticsSdk,
  ArcxAnalyticsContext,
  SdkConfig,
  useArcxAnalytics,
} from '../src'
import { expect } from 'chai'
import sinon from 'sinon'
import * as postRequestModule from '../src/utils/postRequest'
import {
  ATTRIBUTION_EVENT,
  CLICK_EVENT,
  DEFAULT_SDK_CONFIG,
  PAGE_EVENT,
  REFERRER_EVENT,
} from '../src/constants'
import React from 'react'
import {
  TEST_IDENTITY,
  TEST_JSDOM_URL,
  TEST_REFERRER,
} from './constants'
import { MockEthereum } from './MockEthereum'
import globalJsdom from 'global-jsdom'
import * as SocketClientModule from '../src/utils/createClientSocket'
import { Socket } from 'socket.io-client'

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
    <ArcxAnalyticsContext.Consumer>
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
    </ArcxAnalyticsContext.Consumer>
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
  let socketStub: sinon.SinonStubbedInstance<Socket>

  beforeEach(async () => {
    cleanup = globalJsdom(undefined, {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })

    socketStub = sinon.createStubInstance(Socket) as any
    socketStub.connected = true
    sinon.stub(SocketClientModule, 'createClientSocket').returns(socketStub as any)

    window.ethereum = sinon.createStubInstance(MockEthereum)

    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)

    // Stub _trackPagesChange because requestAnimationFrame throws during testing
    // To be fixed in https://github.com/arcxmoney/analytics-sdk/issues/23
    sinon.stub(ArcxAnalyticsSdk.prototype, '_trackPagesChange' as any)
  })

  afterEach(sinon.restore)

  after(() => {
    cleanup()
  })

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

    describe('#trackClicks', () => {
      let screen: RenderResult

      const getClickEventBody = (elementId: string, content: string) => {
        return {
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

      it('track clicks on elements with defined classname and id', async () => {
        screen.getByTestId('track-click').click()

        expect(socketStub.emit).calledOnceWith(
          'submit-event',
          getClickEventBody('div#id-for-click.test-classname-1.test-classname-2', 'Text to click'),
        )
      })

      it('track clicks on elements that do not have defined class names or IDs', async () => {
        screen.getByText(`Identity: ${TEST_IDENTITY}`).click()

        expect(socketStub.emit).calledOnceWith(
          'submit-event',
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

      expect(socketStub.emit).calledOnceWith('submit-event', {
        event: 'test-event',
        attributes: { gm: 'gm' },
      })
    })

    it('posts a page event', async () => {
      screen.getByText('fire page event').click()

      expect(socketStub.emit).calledOnceWith('submit-event', {
        event: PAGE_EVENT,
        attributes: {
          url: '/test',
        },
      })
    })

    it('posts a transaction event', async () => {
      screen.getByText('fire transaction event').click()

      expect(socketStub.emit).calledOnceWith('submit-event', {
        event: 'TRANSACTION_SUBMITTED',
        attributes: { chain: 1, transaction_hash: '0x123', metadata: {} },
      })
    })

    it('posts an attribute event', async () => {
      screen.getByText('fire attribute event').click()

      expect(socketStub.emit).calledOnceWith('submit-event', {
        event: ATTRIBUTION_EVENT,
        attributes: { source: 'facebook', medium: 'social', campaign: 'ad-camp' },
      })
    })

    it('posts a referrer event', async () => {
      screen.getByText('fire referrer event').click()

      expect(socketStub.emit).calledOnceWith('submit-event', {
        event: REFERRER_EVENT,
        attributes: { referrer: '/test' },
      })
    })
  })
})
