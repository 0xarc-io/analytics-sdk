import sinon from 'sinon'
import { expect } from 'chai'
import { ArcxAnalyticsSdk, SdkConfig } from '../src'
import {
  ATTRIBUTION_EVENT,
  CHAIN_CHANGED_EVENT,
  CONNECT_EVENT,
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  DISCONNECT_EVENT,
  FIRST_PAGE_VISIT,
  IDENTITY_KEY,
  PAGE_EVENT,
  REFERRER_EVENT,
  SIGNING_EVENT,
  TRANSACTION_EVENT,
  TRANSACTION_TRIGGERED,
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
} from './constants'
import { MockEthereum } from './MockEthereum'
import globalJsdom from 'global-jsdom'

const ALL_FALSE_CONFIG: Omit<SdkConfig, 'url'> = {
  cacheIdentity: false,
  trackPages: false,
  trackReferrer: false,
  trackUTM: false,
  trackWalletConnections: false,
  trackChainChanges: false,
  trackTransactions: false,
  trackSigning: false,
}

describe('(unit) ArcxAnalyticsSdk', () => {
  let cleanup: () => void
  let postRequestStub: sinon.SinonStub

  beforeEach(() => {
    cleanup = globalJsdom(undefined, {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })

    window.ethereum = sinon.createStubInstance(MockEthereum)
    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)
  })

  afterEach(() => {
    sinon.restore()
    localStorage.clear()
    sessionStorage.clear()
    cleanup()
  })

  describe('#init', () => {
    describe('cacheIdentity', () => {
      it('does not get the identity from localStorage if `cacheIdentity` is false', async () => {
        const localStorageStub = sinon.stub(localStorage, 'getItem')
        await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
        expect(localStorageStub).to.not.have.been.called
      })

      it('sets the identity in localStorage if `cacheIdentity` is true', async () => {
        expect(localStorage.getItem(IDENTITY_KEY)).to.be.null
        await ArcxAnalyticsSdk.init(TEST_API_KEY, { ...ALL_FALSE_CONFIG, cacheIdentity: true })
        expect(localStorage.getItem(IDENTITY_KEY)).to.equal(TEST_IDENTITY)
      })
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
      const trackFirstPageVisitStub = sinon.stub(
        ArcxAnalyticsSdk.prototype,
        <any>'_trackFirstPageVisit',
      )

      await ArcxAnalyticsSdk.init('', { cacheIdentity: false })

      expect(trackFirstPageVisitStub).to.be.calledOnce
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
      expect(postRequestStub.getCall(0)).calledWithExactly(DEFAULT_SDK_CONFIG.url, '', '/identify')
      expect(postRequestStub.getCall(1)).calledWith(DEFAULT_SDK_CONFIG.url, '', '/submit-event', {
        identityId: TEST_IDENTITY,
        event: FIRST_PAGE_VISIT,
        attributes: {
          url: TEST_JSDOM_URL,
        },
      })
    })

    it('calls _reportCurrentWallet and register the listener if trackWalletConnections is true', async () => {
      window.ethereum = sinon.createStubInstance(MockEthereum)
      const reportCurrentWalletStub = sinon.stub(
        ArcxAnalyticsSdk.prototype,
        '_reportCurrentWallet' as any,
      )
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

      expect(reportCurrentWalletStub.calledOnce).to.be.true
      expect(window.ethereum?.on).calledWithMatch('accountsChanged')
    })

    it('calls _onAccountsChanged when accountsChanged is fired and trackWalletConnections is true', async () => {
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

    it('calls _trackSigning if trackSigning is true', async () => {
      const trackSigningStub = sinon.stub(ArcxAnalyticsSdk.prototype, '_trackSigning' as any)
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackSigning: true })

      expect(trackSigningStub).to.be.calledOnce
    })
  })

  describe('Functionality', () => {
    let analyticsSdk: ArcxAnalyticsSdk

    beforeEach(async () => {
      analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
      // Reset history after init because of the /identify call
      postRequestStub.resetHistory()
    })

    describe('#event', () => {
      it('calls postRequest with the correct params', async () => {
        const attributes = {
          a: 'value',
          b: 'second value',
        }

        await analyticsSdk.event('TEST_EVENT', attributes)
        expect(postRequestStub).calledOnceWith(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getAnalyticsData('TEST_EVENT', attributes),
        )
      })

      it('supports nested attributes', async () => {
        const attributes = { layer1: { layer2: { layer3: { layer4: 'hello!' } } } }

        await analyticsSdk.event('TEST_EVENT', attributes)
        expect(postRequestStub).calledOnceWithExactly(
          DEFAULT_SDK_CONFIG.url,
          TEST_API_KEY,
          '/submit-event',
          getAnalyticsData('TEST_EVENT', attributes),
        )
      })
    })

    describe('#attribute', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const attributes = {
          source: TEST_UTM_SOURCE,
          medium: TEST_UTM_MEDIUM,
          campaign: TEST_UTM_CAMPAIGN,
        }
        await analyticsSdk.attribute(attributes)
        expect(eventStub).calledOnceWithExactly(ATTRIBUTION_EVENT, attributes)
      })
    })

    describe('#page', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const attributes = {
          url: TEST_JSDOM_URL,
        }
        await analyticsSdk.page(attributes)
        expect(eventStub).calledOnceWithExactly(PAGE_EVENT, attributes)
      })
    })

    describe('#connectWallet', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const attributes = {
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        }
        await analyticsSdk.connectWallet(attributes)
        expect(eventStub).calledOnceWithExactly(CONNECT_EVENT, attributes)
      })
    })

    describe('#transaction', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(analyticsSdk, 'event')
        const attributes = {
          chain: '1',
          transactionHash: '0x123456789',
          metadata: { timestamp: '123456' },
        }
        await analyticsSdk.transaction(attributes)
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
      it('locationchange event does not exist', () => {
        const onLocationChangeStub = sinon.stub(analyticsSdk, <any>'_onLocationChange')

        window.dispatchEvent(
          new window.Event('locationchange', { bubbles: true, cancelable: false }),
        )

        expect(onLocationChangeStub).to.not.have.been.called
      })

      it('registers a locationchange event', () => {
        const onLocationChangeStub = sinon.stub(analyticsSdk, <any>'_onLocationChange')
        analyticsSdk['_trackPagesChange']()

        window.dispatchEvent(
          new window.Event('locationchange', { bubbles: true, cancelable: false }),
        )

        expect(onLocationChangeStub).calledOnce
      })

      describe('triggers a locationchange event', () => {
        it('triggers on history.pushState', () => {
          const locationChangeListener = sinon.spy()
          analyticsSdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.history.pushState({}, '', '/new-url')
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers on history.replaceState', () => {
          const locationChangeListener = sinon.spy()
          analyticsSdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.history.replaceState({}, '', '/new-url')
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers on history.popstate', () => {
          const locationChangeListener = sinon.spy()
          analyticsSdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.dispatchEvent(new PopStateEvent('popstate'))
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers multiple times', () => {
          const locationChangeListener = sinon.spy()
          analyticsSdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)

          window.dispatchEvent(new PopStateEvent('popstate'))
          window.history.pushState({}, '', '/new-url')
          window.history.replaceState({}, '', '/new-url')

          expect(locationChangeListener).calledThrice

          window.removeEventListener('locationchange', locationChangeListener)
        })
      })
    })

    describe('#_onLocationChange', () => {
      it('sets the current location in the storage and calls page', () => {
        const pageStub = sinon.stub(analyticsSdk, 'page')
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        analyticsSdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        expect(pageStub).to.be.calledOnceWithExactly({ url: TEST_JSDOM_URL })
      })

      it('sets the current location in the storage and calls page once if path is not changed ', () => {
        const pageStub = sinon.stub(analyticsSdk, 'page')
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        analyticsSdk['_onLocationChange']()
        analyticsSdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        expect(pageStub).to.be.calledOnceWithExactly({ url: TEST_JSDOM_URL })
      })

      it('sets the current location in the storage and calls page twice if the path has changed', () => {
        const pageStub = sinon.stub(analyticsSdk, 'page')
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        analyticsSdk['_onLocationChange']()
        window.history.pushState({}, '', `${TEST_JSDOM_URL}new`)
        analyticsSdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(`${TEST_JSDOM_URL}new`)
        expect(pageStub).to.be.calledTwice
        expect(pageStub.getCall(0)).to.be.calledWithExactly({ url: TEST_JSDOM_URL })
        expect(pageStub.getCall(1)).to.be.calledWithExactly({ url: `${TEST_JSDOM_URL}new` })
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

      it('makes a TRANSACTION_TRIGGERED event', async () => {
        const transactionParams = {
          gas: '0x22719',
          from: '0x884151235a59c38b4e72550b0cf16781b08ef7b0',
          to: '0x03cddc9c7fad4b6848d6741b0ef381470bc675cd',
          data: '0x97b4d89f0...082ec95a',
        }
        const nonce = 12

        const stubProvider = sinon.createStubInstance(MockEthereum)
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

        await window.web3.currentProvider!.request({
          method: 'eth_sendTransaction',
          params: [transactionParams],
        })
        expect(eventStub).calledWithExactly(TRANSACTION_TRIGGERED, {
          ...transactionParams,
          nonce,
        })
      })
    })

    describe('#_trackSigning', () => {
      const params = [
        '0x884151235a59c38b4e72550b0cf16781b08ef7b0',
        '0x389423948....4392049230493204',
      ]

      it('does not change request if provider is undefined', async () => {
        window.web3 = undefined
        window.ethereum = undefined
        expect(analyticsSdk['_trackSigning']()).to.be.false
      })

      it('ethereum is not undefined', () => {
        expect(analyticsSdk['_trackSigning']()).to.be.true
      })

      it('makes a SIGNING_EVENT event if personal_sign appears', async () => {
        const method = 'personal_sign'

        analyticsSdk['_trackSigning']()
        const eventStub = sinon.stub(analyticsSdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(SIGNING_EVENT, {
          account: params[1],
          messageToSign: params[0],
          password: undefined,
        })
      })

      it('makes a SIGNING_EVENT event if eth_sign appears', async () => {
        const method = 'eth_sign'

        analyticsSdk['_trackSigning']()
        const eventStub = sinon.stub(analyticsSdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(SIGNING_EVENT, {
          account: params[0],
          messageToSign: params[1],
        })
      })

      it('makes a SIGNING_EVENT event if signTypedData_v4 appears', async () => {
        const method = 'signTypedData_v4'

        analyticsSdk['_trackSigning']()
        const eventStub = sinon.stub(analyticsSdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(SIGNING_EVENT, {
          account: params[0],
          messageToSign: params[1],
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
