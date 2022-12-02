import sinon from 'sinon'
import { expect } from 'chai'
import { ArcxAnalyticsSdk, SdkConfig } from '../src'
import {
  ATTRIBUTION_EVENT,
  CAUGHT_TRANSACTION_EVENT,
  CHAIN_CHANGED_EVENT,
  CONNECT_EVENT,
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  DISCONNECT_EVENT,
  FIRST_PAGE_VISIT,
  IDENTITY_KEY,
  PAGE_EVENT,
  REFERRER_EVENT,
  TRANSACTION_EVENT,
} from '../src/constants'
import * as postRequestModule from '../src/helpers/postRequest'
import {
  TEST_ACCOUNT,
  TEST_API_KEY,
  TEST_CHAIN_ID,
  TEST_IDENTITY,
  TEST_JSDOM_URL,
  TEST_REFERRER,
  TEST_UTM_CAMPAIGN,
  TEST_UTM_MEDIUM,
  TEST_UTM_SOURCE,
} from './fixture'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { MockEthereum } from './MockEthereum'

const ALL_FALSE_CONFIG: SdkConfig = {
  ...DEFAULT_SDK_CONFIG,
  cacheIdentity: false,
  trackPages: false,
  trackReferrer: false,
  trackUTM: false,
  trackWalletConnections: false,
  trackChainChanges: false,
  trackTransactions: false,
}

describe('(unit) ArcxAnalyticsSdk', () => {
  let analyticsSdk: ArcxAnalyticsSdk
  let postRequestStub: sinon.SinonStub

  beforeEach(async () => {
    const ethereumMock = sinon.createStubInstance(MetaMaskInpageProvider)
    window.ethereum = ethereumMock
    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)

    analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)

    postRequestStub.resetHistory()
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(sinon.restore)

  describe('Public Functions', () => {
    describe('#init', () => {
      it('does not get the identity from localStorage if `cacheIdentity` is false', async () => {
        const localStorageStub = sinon.stub(localStorage, 'getItem')
        await ArcxAnalyticsSdk.init(TEST_API_KEY, { ...ALL_FALSE_CONFIG, cacheIdentity: false })
        expect(localStorageStub).to.not.have.been.called
      })

      it('sets the identity in localStorage if `cacheIdentity` is true', async () => {
        expect(localStorage.getItem(IDENTITY_KEY)).to.be.null
        await ArcxAnalyticsSdk.init(TEST_API_KEY, { ...ALL_FALSE_CONFIG, cacheIdentity: true })
        expect(localStorage.getItem(IDENTITY_KEY)).to.equal(TEST_IDENTITY)
      })

      it('makes an /identity call when no identity is found in localStorage', async () => {
        await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)
        expect(postRequestStub.calledOnceWith(DEFAULT_SDK_CONFIG.url, '', '/identify')).to.be.true
      })

      it('sets the current URL in the session storage when `trackPages` is true', async () => {
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null
        expect(window.location.href).to.eq(TEST_JSDOM_URL)

        await ArcxAnalyticsSdk.init('', { trackPages: true })

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
      })

      it('makes an initial FIRST_PAGE_VISIT call url, utm and referrer if using the default config', async () => {
        await ArcxAnalyticsSdk.init('', { cacheIdentity: false })
        expect(postRequestStub.getCall(0)).to.have.been.calledWithExactly(
          DEFAULT_SDK_CONFIG.url,
          '',
          '/identify',
        )
        expect(postRequestStub.getCall(1)).to.have.been.calledWithExactly(
          DEFAULT_SDK_CONFIG.url,
          '',
          '/submit-event',
          {
            identityId: TEST_IDENTITY,
            event: FIRST_PAGE_VISIT,
            attributes: {
              url: TEST_JSDOM_URL,
              referrer: TEST_REFERRER,
              utm: {
                source: TEST_UTM_SOURCE,
                medium: TEST_UTM_MEDIUM,
                campaign: TEST_UTM_CAMPAIGN,
              },
            },
          },
        )
      })

      it('does not make a FIRST_PAGE_VISIT call if trackPages, referrer and UTM configs are set to false', async () => {
        await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)

        expect(postRequestStub).to.have.been.calledOnceWithExactly(
          DEFAULT_SDK_CONFIG.url,
          '',
          '/identify',
        )
      })

      it('does not include the UTM object if trackUTM is set to false', async () => {
        await ArcxAnalyticsSdk.init('', {
          ...ALL_FALSE_CONFIG,
          trackPages: true,
        })
        expect(postRequestStub.getCall(0)).calledWithExactly(
          DEFAULT_SDK_CONFIG.url,
          '',
          '/identify',
        )
        expect(postRequestStub.getCall(1)).calledWith(DEFAULT_SDK_CONFIG.url, '', '/submit-event', {
          identityId: TEST_IDENTITY,
          event: FIRST_PAGE_VISIT,
          attributes: {
            url: TEST_JSDOM_URL,
          },
        })
      })

      it('calls _reportCurrentWallet and register the listener if trackWalletConnections is true', async () => {
        const reportCurrentWalletStub = sinon.stub(
          ArcxAnalyticsSdk.prototype,
          '_reportCurrentWallet' as any,
        )
        await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

        expect(reportCurrentWalletStub.calledOnce).to.be.true
        expect(window.ethereum?.on).calledWithMatch('accountsChanged')
      })

      it('calls _onAccountsChanged when accountsChanged is fied and trackWalletConnections is true', async () => {
        window.ethereum = new MockEthereum() as any
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

        const onAccountsChangedStub = sinon.stub(sdk, '_onAccountsChanged' as any)

        window.ethereum?.emit('accountsChanged', [TEST_ACCOUNT])
        expect(onAccountsChangedStub).calledOnceWithExactly([TEST_ACCOUNT])
      })

      it('calls _onChainChanged when chainChanged is fired and trackChainChanges is true', async () => {
        window.ethereum = new MockEthereum() as any
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackChainChanges: true })

        const onChainChangedStub = sinon.stub(sdk, '_onChainChanged' as any)

        window.ethereum?.emit('chainChanged', TEST_CHAIN_ID)
        expect(onChainChangedStub).calledOnceWithExactly(TEST_CHAIN_ID)
      })
    })

    describe('#event', () => {
      it('calls postRequest with the correct params', async () => {
        const testAttributes = {
          a: 'value',
          b: 'second value',
        }

        await analyticsSdk.event('TEST_EVENT', testAttributes)
        expect(postRequestStub).calledOnceWith(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getAnalyticsData('TEST_EVENT', testAttributes),
        )
      })

      it('supports nested attributes', async () => {
        const pageAttributes = { layer1: { layer2: { layer3: { layer4: 'hello!' } } } }

        await analyticsSdk.event('TEST_EVENT', pageAttributes)
        expect(postRequestStub).calledOnceWithExactly(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getAnalyticsData('TEST_EVENT', pageAttributes),
        )
      })
    })

    describe('#attribute', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const testAttributes = {
          source: TEST_UTM_SOURCE,
          medium: TEST_UTM_MEDIUM,
          campaign: TEST_UTM_CAMPAIGN,
        }
        await analyticsSdk.attribute(testAttributes)
        expect(eventStub).calledOnceWithExactly(ATTRIBUTION_EVENT, testAttributes)
      })
    })

    describe('#page', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const testAttributes = {
          url: TEST_JSDOM_URL,
        }
        await analyticsSdk.page(testAttributes)
        expect(eventStub).calledOnceWithExactly(PAGE_EVENT, testAttributes)
      })
    })

    describe('#connectWallet', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const testAttributes = {
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        }
        await analyticsSdk.connectWallet(testAttributes)
        expect(eventStub).calledOnceWithExactly(CONNECT_EVENT, testAttributes)
      })
    })

    describe('#transaction', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const testAttributes = {
          chain: '1',
          transactionHash: '0x123456789',
          metadata: { timestamp: '123456' },
        }
        await analyticsSdk.transaction(testAttributes)
        expect(eventStub).calledOnceWithExactly(TRANSACTION_EVENT, {
          chain: '1',
          transaction_hash: '0x123456789',
          metadata: { timestamp: '123456' },
        })
      })
    })

    describe('#referrer', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        await analyticsSdk.referrer(TEST_REFERRER)
        expect(eventStub.calledOnceWith(REFERRER_EVENT, { referrer: TEST_REFERRER })).to.be.true
      })
    })
  })

  describe('Private functions', () => {
    describe('#_trackFirstPageVisit', () => {
      let eventStub: sinon.SinonStub

      beforeEach(() => {
        eventStub = sinon.stub(analyticsSdk, 'event')
      })

      it('sets the current window location to sessionStorage if trackPages is true', () => {
        analyticsSdk['sdkConfig'].trackPages = true

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null
        analyticsSdk['_trackFirstPageVisit']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        analyticsSdk['sdkConfig'].trackPages = false
      })

      it('emits a FIRST_PAGE_VISIT event with url if trackPages is true', () => {
        analyticsSdk['sdkConfig'].trackPages = true

        analyticsSdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(FIRST_PAGE_VISIT, { url: TEST_JSDOM_URL })

        analyticsSdk['sdkConfig'].trackPages = false
      })

      it('emits a FIRST_PAGE_VISIT event with referrer if trackReferrer is true', () => {
        analyticsSdk['sdkConfig'].trackReferrer = true

        analyticsSdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(FIRST_PAGE_VISIT, { referrer: TEST_REFERRER })

        analyticsSdk['sdkConfig'].trackReferrer = false
      })

      it('emits a FIRST_PAGE_VISIT event with utm tags if trackUTM is true', () => {
        analyticsSdk['sdkConfig'].trackUTM = true

        analyticsSdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(FIRST_PAGE_VISIT, {
          utm: {
            source: TEST_UTM_SOURCE,
            medium: TEST_UTM_MEDIUM,
            campaign: TEST_UTM_CAMPAIGN,
          },
        })

        analyticsSdk['sdkConfig'].trackUTM = false
      })

      it('emits a FIRST_PAGE_VISIT event with url, referrer and UTM attributes if trackPages, referrer and UTM configs are set to true', () => {
        analyticsSdk['sdkConfig'].trackPages = true
        analyticsSdk['sdkConfig'].trackReferrer = true
        analyticsSdk['sdkConfig'].trackUTM = true

        analyticsSdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(FIRST_PAGE_VISIT, {
          url: TEST_JSDOM_URL,
          referrer: TEST_REFERRER,
          utm: {
            source: TEST_UTM_SOURCE,
            medium: TEST_UTM_MEDIUM,
            campaign: TEST_UTM_CAMPAIGN,
          },
        })

        analyticsSdk['sdkConfig'].trackPages = false
        analyticsSdk['sdkConfig'].trackReferrer = false
        analyticsSdk['sdkConfig'].trackUTM = false
      })
    })

    describe('#_trackPagesChange', () => {
      it('registers an on-click event listener', () => {
        const addEventListenerStub = sinon.stub(document.body, 'addEventListener')

        analyticsSdk['_trackPagesChange']()

        expect(addEventListenerStub).calledOnce
      })
    })

    describe('#_onAccountsChanged', () => {
      it('does nothing if account is the same as this.currentConnectedAccount', () => {
        analyticsSdk.currentConnectedAccount = TEST_ACCOUNT

        const eventStub = sinon.stub(analyticsSdk, 'event')
        analyticsSdk['_onAccountsChanged']([TEST_ACCOUNT])

        expect(eventStub).not.called
      })

      it('calls _handleAccountConnected when an account is given', () => {
        const handleAccountConnectedStub = sinon.stub(analyticsSdk, <any>'_handleAccountConnected')

        analyticsSdk['_onAccountsChanged']([TEST_ACCOUNT])

        expect(handleAccountConnectedStub).calledOnceWithExactly(TEST_ACCOUNT)
      })

      it('calls _handleAccountDisconnected when no account is given', () => {
        const handleAccountDisconnectedStub = sinon.stub(
          analyticsSdk,
          <any>'_handleAccountDisconnected',
        )

        analyticsSdk['_onAccountsChanged']([])

        expect(handleAccountDisconnectedStub).calledOnce
      })
    })

    describe('#_handleAccountConnected', () => {
      it('calls connectWallet with the correct params', async () => {
        sinon.stub(analyticsSdk, <any>'_getCurrentChainId').resolves(TEST_CHAIN_ID)
        const connectWalletStub = sinon.stub(analyticsSdk, 'connectWallet')

        expect(analyticsSdk.currentChainId).to.be.undefined
        await analyticsSdk['_handleAccountConnected'](TEST_ACCOUNT)
        expect(analyticsSdk.currentChainId).to.eq(TEST_CHAIN_ID)

        expect(connectWalletStub).calledOnceWithExactly({
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        })
      })
    })

    describe('#_handleAccountDisconnected', () => {
      it('throws if no current chain ID is not set', () => {
        expect(analyticsSdk.currentChainId).to.be.undefined
        expect(analyticsSdk.currentConnectedAccount).to.be.undefined
        expect(() => analyticsSdk['_handleAccountDisconnected']()).to.throw()
      })

      it('clears the current chain id and account', () => {
        analyticsSdk.currentChainId = TEST_CHAIN_ID
        analyticsSdk.currentConnectedAccount = TEST_ACCOUNT

        analyticsSdk['_handleAccountDisconnected']()

        expect(analyticsSdk.currentChainId).to.be.undefined
        expect(analyticsSdk.currentConnectedAccount).to.be.undefined
      })

      it('emits a DISCONNECT event with the correct params', () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')

        analyticsSdk.currentChainId = TEST_CHAIN_ID
        analyticsSdk.currentConnectedAccount = TEST_ACCOUNT

        analyticsSdk['_handleAccountDisconnected']()

        expect(eventStub).calledOnceWithExactly(DISCONNECT_EVENT, {
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        })
      })
    })

    describe('#_onChainChanged', () => {
      it('converts hex chain id to decimal and fires event', () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')

        analyticsSdk['_onChainChanged']('0x1')

        expect(eventStub).calledOnceWithExactly(CHAIN_CHANGED_EVENT, {
          chain: TEST_CHAIN_ID,
        })
      })
    })

    describe('#_reportCurrentWallet', () => {
      it('returns if window.ethereum is non-existent', async () => {
        const requestStub = window.ethereum?.request
        const warnStub = sinon.stub(console, 'warn')
        const originalEthereum = window.ethereum

        window.ethereum = undefined
        await analyticsSdk['_reportCurrentWallet']()

        expect(requestStub).to.not.have.been.called
        expect(warnStub).to.have.been.called
        window.ethereum = originalEthereum
      })

      it('calls ethereum.request with eth_accounts', async () => {
        const requestStub = window.ethereum?.request

        await analyticsSdk['_reportCurrentWallet']()

        expect(requestStub).calledOnceWithExactly({ method: 'eth_accounts' })
      })

      it('does not call _handleAccountConnected if an account is returned', async () => {
        const handleAccountConnectedStub = sinon.stub(analyticsSdk, <any>'_handleAccountConnected')
        ;(window.ethereum?.request as any).resolves([])

        await analyticsSdk['_reportCurrentWallet']()

        expect(handleAccountConnectedStub).not.called
      })

      it('calls _handleAccountConnected if an account is returned', async () => {
        const handleAccountConnectedStub = sinon.stub(analyticsSdk, <any>'_handleAccountConnected')
        ;(window.ethereum?.request as any).resolves([TEST_ACCOUNT])

        await analyticsSdk['_reportCurrentWallet']()

        expect(handleAccountConnectedStub).calledOnceWithExactly(TEST_ACCOUNT)
      })
    })

    describe('#_getCurrentChainId', () => {
      it('throws if window.ethereum is undefined', async () => {
        const originalEthereum = window.ethereum
        window.ethereum = undefined

        try {
          await analyticsSdk['_getCurrentChainId']()
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::_getCurrentChainId: No ethereum provider found',
          )
        }

        window.ethereum = originalEthereum
      })

      it('throws if no chain id is returned from ethereum.reqeust eth_chainId', async () => {
        const request: any = window.ethereum?.request
        request.resolves(undefined)

        try {
          await analyticsSdk['_getCurrentChainId']()
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::_getCurrentChainId: chainIdHex is: undefined',
          )
        }
      })

      it('calls eth_chainId and returns a converted decimal chain id', async () => {
        const requestStub = (window.ethereum?.request as any).resolves('0x1')

        const chainId = await analyticsSdk['_getCurrentChainId']()

        expect(requestStub).calledOnceWithExactly({ method: 'eth_chainId' })
        expect(chainId).to.eq('1')
      })
    })

    describe('#_trackTransactions', () => {
      it('does not change request if provider is undefined', () => {
        window.web3 = undefined
        window.ethereum = undefined
        expect(analyticsSdk['_trackTransactions']()).to.be.false
      })

      it('makes a CAUGHT_TRANSACTION_SUBMITTED event', async () => {
        const transactionParams = {
          gas: '0x22719',
          from: '0xbb4153b55a59cc8bde72550b0cf16781b08ef7b0',
          to: '0x03cddc9c7fad4b6848d6741b0ef381470bc675cd',
          data: '0x97b4d89f0...082ec95a',
        }
        const nonce = 12

        const stubProvider = sinon.createStubInstance(MetaMaskInpageProvider)
        window.web3 = {
          currentProvider: stubProvider,
        }

        stubProvider.request.returns(nonce as any).withArgs({
          method: 'eth_getTransactionCount',
          params: [transactionParams.from, 'latest'],
        })

        analyticsSdk = await ArcxAnalyticsSdk.init('', {
          ...ALL_FALSE_CONFIG,
          trackTransactions: true,
        })
        const eventStub = sinon.stub(analyticsSdk, 'event')

        await window.web3.currentProvider.request({
          method: 'eth_sendTransaction',
          params: [transactionParams],
        })
        expect(eventStub).calledWithExactly(CAUGHT_TRANSACTION_EVENT, {
          ...transactionParams,
          nonce,
        })
      })
    })
  })
})

function getAnalyticsData(event: string, attributes: any) {
  return {
    identityId: TEST_IDENTITY,
    event,
    attributes,
  }
}
