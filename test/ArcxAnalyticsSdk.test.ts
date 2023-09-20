import sinon from 'sinon'
import { expect } from 'chai'
import { ArcxAnalyticsSdk, SdkConfig } from '../src'
import {
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  IDENTITY_KEY,
  SDK_VERSION,
  Events,
} from '../src/constants'
import * as postRequestModule from '../src/utils/postRequest'
import {
  TEST_ACCOUNT,
  TEST_API_KEY,
  TEST_CHAIN_ID,
  TEST_IDENTITY,
  TEST_JSDOM_URL,
  TEST_REFERRER,
  TEST_SCREEN,
  TEST_UTM_CAMPAIGN,
  TEST_UTM_MEDIUM,
  TEST_UTM_SOURCE,
  TEST_VIEWPORT,
} from './constants'
import { MockEthereum } from './MockEthereum'
import globalJsdom from 'global-jsdom'
import EventEmitter from 'events'
import * as SocketClientModule from '../src/utils/createClientSocket'
import { Socket } from 'socket.io-client'
import { fail } from 'assert'

const ALL_FALSE_CONFIG: Omit<SdkConfig, 'url'> = {
  cacheIdentity: false,
  trackPages: false,
  trackWalletConnections: false,
  trackTransactions: false,
  trackSigning: false,
  trackClicks: false,
}

describe('(unit) ArcxAnalyticsSdk', () => {
  let cleanup: () => void
  let postRequestStub: sinon.SinonStub
  let createClientSocketStub: sinon.SinonStub
  let socketStub: sinon.SinonStubbedInstance<Socket>

  beforeEach(() => {
    cleanup = globalJsdom(undefined, {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })

    window.ethereum = sinon.createStubInstance(MockEthereum)
    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)
    socketStub = sinon.createStubInstance(Socket) as any
    socketStub.connected = true
    createClientSocketStub = sinon
      .stub(SocketClientModule, 'createClientSocket')
      .returns(socketStub as any)
    sinon.stub(screen, 'height').value(TEST_SCREEN.height)
    sinon.stub(screen, 'width').value(TEST_SCREEN.width)
    sinon.stub(window, 'innerHeight').value(TEST_VIEWPORT.height)
    sinon.stub(window, 'innerWidth').value(TEST_VIEWPORT.width)
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

    it('makes an initial PAGE call if using the default config', async () => {
      await ArcxAnalyticsSdk.init('', { cacheIdentity: false })

      expect(socketStub.emit.firstCall).calledWith(
        'submit-event',
        getAnalyticsData(Events.PAGE, {
          referrer: TEST_REFERRER,
        }),
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

    describe('trackWalletConnections', () => {
      it('calls _reportCurrentWallet and register the listener if trackWalletConnections is true', async () => {
        window.ethereum = sinon.createStubInstance(MockEthereum)
        const reportCurrentWalletStub = sinon.stub(
          ArcxAnalyticsSdk.prototype,
          '_reportCurrentWallet' as any,
        )
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

        expect(reportCurrentWalletStub.calledOnce).to.be.true
        expect(sdk.provider?.on).calledWithMatch('accountsChanged')
        expect(sdk['_registeredProviderListeners']['accountsChanged']).to.not.be.null
      })

      it('calls _onAccountsChanged when accountsChanged is fired and trackWalletConnections is true', async () => {
        const provider = new MockEthereum()
        window.ethereum = provider
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

        const onAccountsChangedStub = sinon.stub(sdk, '_onAccountsChanged' as any)

        provider.emit('accountsChanged', [TEST_ACCOUNT])
        expect(onAccountsChangedStub).calledOnceWithExactly([TEST_ACCOUNT])
      })
    })

    it('calls _trackSigning if trackSigning is true', async () => {
      const trackSigningStub = sinon.stub(ArcxAnalyticsSdk.prototype, '_trackSigning' as any)
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackSigning: true })

      expect(trackSigningStub).to.be.calledOnce
    })

    it('calls _trackClicks if config.trackClicks is true', async () => {
      const trackClicksStub = sinon.stub(ArcxAnalyticsSdk.prototype, '_trackClicks' as any)
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { ...ALL_FALSE_CONFIG, trackClicks: true })

      expect(trackClicksStub).to.be.calledOnce
    })

    it('does not throw if window.ethereum.request is read-only', async () => {
      Object.defineProperty(window.ethereum, 'request', {
        value: () => console.log('modified request'),
        writable: false,
      })

      await ArcxAnalyticsSdk.init(TEST_API_KEY)
    })

    it('creates a websocket instance with query attributes', async () => {
      const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY)

      expect(sdk['socket']).to.be.eq(socketStub)
      expect(createClientSocketStub).to.be.calledOnceWith(DEFAULT_SDK_CONFIG.url, {
        apiKey: TEST_API_KEY,
        identityId: TEST_IDENTITY,
        sdkVersion: SDK_VERSION,
        screenHeight: TEST_SCREEN.height,
        screenWidth: TEST_SCREEN.width,
        viewportHeight: TEST_VIEWPORT.height,
        viewportWidth: TEST_VIEWPORT.width,
        url: TEST_JSDOM_URL,
      })
    })

    describe('initialProvider', () => {
      it('sets window.ethereum to the _provider if no initialProvider is passed', async () => {
        window.ethereum = new MockEthereum()
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
        expect(sdk.provider).to.eq(window.ethereum)
        expect(sdk['_provider']).to.eq(window.ethereum)
      })

      it('sets a given provider to the _provider if initialProvider is passed', async () => {
        const provider = new MockEthereum()
        const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, {
          ...ALL_FALSE_CONFIG,
          initialProvider: provider,
        })
        expect(sdk.provider).to.eq(provider)
      })
    })
  })

  describe('Functionality', () => {
    let sdk: ArcxAnalyticsSdk

    beforeEach(async () => {
      sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
      // Reset history after init because of the /identify call
      postRequestStub.resetHistory()
    })

    describe('#event', () => {
      it('emits an event with the correct params if the socket is connected', () => {
        const attributes = {
          a: 'a',
          b: 'b',
          c: {
            d: 'd',
            e: 21,
          },
        }
        sdk.event('TEST_EVENT', attributes)
        expect(socketStub.emit).calledOnceWithExactly(
          'submit-event',
          getAnalyticsData('TEST_EVENT', attributes),
        )
      })

      it('supports nested attributes', async () => {
        const attributes = { layer1: { layer2: { layer3: { layer4: 'hello!' } } } }

        await sdk.event('TEST_EVENT', attributes)
        expect(socketStub.emit).calledOnceWithExactly(
          'submit-event',
          getAnalyticsData('TEST_EVENT', attributes),
        )
      })
    })

    describe('#attribute', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          source: TEST_UTM_SOURCE,
          medium: TEST_UTM_MEDIUM,
          campaign: TEST_UTM_CAMPAIGN,
        }
        await sdk.attribute(attributes)
        expect(eventStub).calledOnceWithExactly(Events.ATTRIBUTION, attributes)
      })
    })

    describe('#page', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          referrer: TEST_REFERRER,
        }
        sdk.page()
        expect(eventStub).calledOnceWithExactly(Events.PAGE, attributes)
      })
    })

    describe('#wallet', () => {
      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          chainId: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        }
        await sdk.wallet(attributes)
        expect(eventStub).calledOnceWithExactly(Events.CONNECT, {
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        })
      })
    })

    describe('disconnection', () => {
      it('does not send an event if account and currentConnectedAccount are empty', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        await sdk.disconnection()
        expect(eventStub).to.not.have.been.called
      })

      it('submits a disconnect event with the given account if account is given', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        await sdk.disconnection({ account: TEST_ACCOUNT })
        expect(eventStub).calledOnceWithExactly(Events.DISCONNECT, {
          account: TEST_ACCOUNT,
        })
      })

      it('submits a disconnect event with the currentConnectedAccount if account is not given', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        sdk.currentConnectedAccount = TEST_ACCOUNT
        await sdk.disconnection()
        expect(eventStub).calledOnceWithExactly(Events.DISCONNECT, {
          account: TEST_ACCOUNT,
        })
      })

      it('sets the current chain id and current connected account to undefined', async () => {
        sdk.currentChainId = TEST_CHAIN_ID
        sdk.currentConnectedAccount = TEST_ACCOUNT
        await sdk.disconnection()
        expect(sdk.currentChainId).to.be.undefined
        expect(sdk.currentConnectedAccount).to.be.undefined
      })
    })

    describe('#chain', () => {
      it('throws if chainId is not provideed', async () => {
        try {
          await sdk.chain({
            chainId: '0',
          })
        } catch (err: any) {
          expect(err.message).to.eq('ArcxAnalyticsSdk::chainChanged: chainId cannot be empty or 0')
          return
        }
        fail('should throw')
      })

      it('throws if chainId is not a valid hex or decimal number', async () => {
        try {
          await sdk.chain({
            chainId: 'eth',
          })
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::chainChanged: chainId must be a valid hex or decimal number',
          )
          return
        }
        fail('should throw')
      })

      it('sets currentChainId to the given chainId', async () => {
        expect(sdk.currentChainId).to.be.undefined

        await sdk.chain({
          chainId: parseInt(TEST_CHAIN_ID),
        })

        expect(sdk.currentChainId).to.eq(TEST_CHAIN_ID)
      })

      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          chainId: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        }
        await sdk.chain(attributes)
        expect(eventStub).calledOnceWithExactly(Events.CHAIN_CHANGED, {
          chain: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        })
      })

      it('if no account is passed, use the previously recorded account', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          chainId: TEST_CHAIN_ID,
        }
        sdk.currentConnectedAccount = '0x123'
        await sdk.chain(attributes)
        expect(eventStub).calledOnceWithExactly(Events.CHAIN_CHANGED, {
          chain: TEST_CHAIN_ID,
          account: '0x123',
        })
      })
    })

    describe('#transaction', () => {
      it('throws if transactionHash is empty', async () => {
        try {
          await sdk.transaction({
            transactionHash: '',
          })
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::transaction: transactionHash cannot be empty',
          )
          return
        }
        fail('should throw')
      })

      it('calls event() with the given attributes', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const attributes = {
          chainId: '1',
          transactionHash: '0x123456789',
          metadata: { timestamp: '123456' },
        }
        await sdk.transaction(attributes)
        expect(eventStub).calledOnceWithExactly(Events.TRANSACTION, {
          chain: '1',
          transaction_hash: '0x123456789',
          metadata: { timestamp: '123456' },
        })
      })
    })

    describe('#signature', () => {
      it('throws if message is empty', async () => {
        try {
          await sdk.signature({
            message: '',
          })
        } catch (err: any) {
          expect(err.message).to.eq('ArcxAnalyticsSdk::signedMessage: message cannot be empty')
          return
        }
        fail('should throw')
      })

      it('throws if account is undefined and currentConnectedAccount is undefined', async () => {
        expect(sdk.currentConnectedAccount).to.be.undefined

        try {
          await sdk.signature({
            message: 'hello',
          })
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::signedMessage: account cannot be empty and was not previously recorded',
          )
          return
        }
        fail('should throw')
      })

      it('submits a signing event with the currentConnectedAccount if account is undefined', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        sdk.currentConnectedAccount = TEST_ACCOUNT
        await sdk.signature({
          message: 'hello',
        })
        expect(eventStub).calledOnceWithExactly(Events.SIGNING_TRIGGERED, {
          account: TEST_ACCOUNT,
          message: 'hello',
        })
      })

      it('submits a signing event with the given account if account is defined', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const account = '0x123'
        await sdk.signature({
          account,
          message: 'hello',
        })
        expect(eventStub).calledOnceWithExactly(Events.SIGNING_TRIGGERED, {
          account,
          message: 'hello',
        })
      })

      it('submits a signing event with the given hash if hash is defined', async () => {
        const eventStub = sinon.stub(sdk, 'event')
        const account = '0x123'
        const hash = '0x123456789'
        await sdk.signature({
          account,
          signatureHash: hash,
          message: 'hello',
        })
        expect(eventStub).calledOnceWithExactly(Events.SIGNING_TRIGGERED, {
          account,
          signatureHash: hash,
          message: 'hello',
        })
      })
    })

    describe('setProvider', () => {
      it('deletes currentChainId and currentConnectedAccount if setting to undefined', () => {
        sdk['currentChainId'] = TEST_CHAIN_ID
        sdk['currentConnectedAccount'] = TEST_ACCOUNT
        sdk.setProvider(undefined)
        expect(sdk['currentChainId']).to.be.undefined
        expect(sdk['currentConnectedAccount']).to.be.undefined
      })

      describe('setting a provider', () => {
        it('saves the original `request` to _originalRequest', async () => {
          const provider = new MockEthereum()
          const originalRequest = provider.request
          window.ethereum = undefined
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackTransactions: true })

          expect(sdk['_originalRequest']).to.be.undefined

          sdk.setProvider(provider)

          expect(sdk['_originalRequest']).to.eq(originalRequest)
        })

        it('sets `provider` to the given provider', () => {
          expect(sdk.provider).to.eq(window.ethereum)

          sdk.setProvider(undefined)
          expect(sdk.provider).to.be.undefined

          const newProvider = new MockEthereum()
          sdk.setProvider(newProvider)
          expect(sdk.provider).to.eq(newProvider)
        })

        it('calls _registerAccountsChangedListener if trackWalletConnections is true', async () => {
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

          const registerAccountsChangedStub = sinon.stub(
            sdk,
            '_registerAccountsChangedListener' as any,
          )

          expect(sdk['sdkConfig'].trackTransactions).to.be.true

          sdk.setProvider(new MockEthereum())
          expect(registerAccountsChangedStub).to.be.called
        })

        it('calls _trackSigning if trackSigning is true', async () => {
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackSigning: true })

          const trackSigningStub = sinon.stub(sdk, '_trackSigning' as any)

          expect(sdk['sdkConfig'].trackSigning).to.be.true

          sdk.setProvider(new MockEthereum())
          expect(trackSigningStub).to.be.called
        })

        it('calls _trackTransactions if trackTransactions is true', async () => {
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackTransactions: true })

          const trackTransactionsStub = sinon.stub(sdk, '_trackTransactions' as any)

          expect(sdk['sdkConfig'].trackTransactions).to.be.true

          sdk.setProvider(new MockEthereum())
          expect(trackTransactionsStub).to.be.called
        })
      })

      describe('if a previous provider was set', () => {
        it('resets the original `request` function if trackTransactions is true', async () => {
          window.ethereum = new MockEthereum()
          const originalRequest = window.ethereum.request
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackTransactions: true })

          // Original request was changed during initialization
          expect(window.ethereum.request).to.not.eq(originalRequest)

          const newProvider = new MockEthereum()
          sdk.setProvider(newProvider)

          expect(window.ethereum.request).to.eq(originalRequest)
        })

        it('resets the original `request` function if trackSigning is true', async () => {
          window.ethereum = new MockEthereum()
          const originalRequest = window.ethereum.request
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackSigning: true })

          // Original request was changed during initialization
          expect(window.ethereum.request).to.not.eq(originalRequest)

          const newProvider = new MockEthereum()
          sdk.setProvider(newProvider)

          expect(window.ethereum.request).to.eq(originalRequest)
        })

        it('removes listeners if the new provider is undefined', async () => {
          window.ethereum = new MockEthereum()
          const sdk = await ArcxAnalyticsSdk.init(TEST_API_KEY)

          expect(sdk.provider).to.not.be.undefined
          expect((window.ethereum as any as EventEmitter).listenerCount('accountsChanged')).to.eq(1)

          sdk.setProvider(undefined)

          expect((window.ethereum as any as EventEmitter).listenerCount('accountsChanged')).to.eq(0)
        })
      })
    })

    describe('#_reportError', () => {
      it('calls postRequest with error message', async () => {
        const errorMsg = 'TestError: this should not happen'
        await sdk['_report']('error', errorMsg)
        expect(postRequestStub).calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/log-sdk', {
          logLevel: 'error',
          data: {
            identityId: TEST_IDENTITY,
            msg: errorMsg,
            apiKey: TEST_API_KEY,
            url: TEST_JSDOM_URL,
          },
        })
      })

      it('calls postRequest with warning message', async () => {
        const errorMsg = 'TestError: this should not happen'
        await sdk['_report']('warning', errorMsg)
        expect(postRequestStub).calledOnceWith(DEFAULT_SDK_CONFIG.url, TEST_API_KEY, '/log-sdk', {
          logLevel: 'warning',
          data: {
            identityId: TEST_IDENTITY,
            msg: errorMsg,
            apiKey: TEST_API_KEY,
            url: TEST_JSDOM_URL,
          },
        })
      })
    })

    describe('#_trackFirstPageVisit', () => {
      let eventStub: sinon.SinonStub

      beforeEach(() => {
        eventStub = sinon.stub(sdk, 'event')
      })

      it('sets the current window location to sessionStorage if trackPages is true', () => {
        sdk['sdkConfig'].trackPages = true

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null
        sdk['_trackFirstPageVisit']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        sdk['sdkConfig'].trackPages = false
      })

      it('emits a PAGE event with url if trackPages is true', () => {
        sdk['sdkConfig'].trackPages = true

        sdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(Events.PAGE, {
          referrer: TEST_REFERRER,
        })

        sdk['sdkConfig'].trackPages = false
      })

      it('emits a PAGE event with url, referrer and UTM attributes if trackPages, referrer and UTM configs are set to true', () => {
        sdk['sdkConfig'].trackPages = true

        sdk['_trackFirstPageVisit']()
        expect(eventStub).calledOnceWithExactly(Events.PAGE, {
          referrer: TEST_REFERRER,
        })

        sdk['sdkConfig'].trackPages = false
      })
    })

    describe('#_trackPagesChange', () => {
      it('locationchange event does not exist', () => {
        const onLocationChangeStub = sinon.stub(sdk, <any>'_onLocationChange')

        window.dispatchEvent(
          new window.Event('locationchange', { bubbles: true, cancelable: false }),
        )

        expect(onLocationChangeStub).to.not.have.been.called
      })

      it('registers a locationchange event', () => {
        const onLocationChangeStub = sinon.stub(sdk, <any>'_onLocationChange')
        sdk['_trackPagesChange']()

        window.dispatchEvent(
          new window.Event('locationchange', { bubbles: true, cancelable: false }),
        )

        expect(onLocationChangeStub).calledOnce
      })

      describe('triggers a locationchange event', () => {
        it('triggers on history.pushState', () => {
          const locationChangeListener = sinon.spy()
          sdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.history.pushState({}, '', '/new-url')
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers on history.replaceState', () => {
          const locationChangeListener = sinon.spy()
          sdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.history.replaceState({}, '', '/new-url')
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers on history.popstate', () => {
          const locationChangeListener = sinon.spy()
          sdk['_trackPagesChange']()

          window.addEventListener('locationchange', locationChangeListener)
          window.dispatchEvent(new PopStateEvent('popstate'))
          expect(locationChangeListener).calledOnce

          window.removeEventListener('locationchange', locationChangeListener)
        })

        it('triggers multiple times', () => {
          const locationChangeListener = sinon.spy()
          sdk['_trackPagesChange']()

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
        const pageStub = sinon.stub(sdk, 'page')
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        sdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        expect(pageStub).to.be.calledOnceWithExactly()
      })

      it('sets the current location in the storage and calls page once if path is not changed ', () => {
        const pageStub = sinon.stub(sdk, 'page')
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        sdk['_onLocationChange']()
        sdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
        expect(pageStub).to.be.calledOnceWithExactly()
      })

      it('sets the current location in the storage and calls page twice if the path has changed', () => {
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null

        sdk['_onLocationChange']()
        window.history.pushState({}, '', `${TEST_JSDOM_URL}new`)
        sdk['_onLocationChange']()

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(`${TEST_JSDOM_URL}new`)
        expect(socketStub.emit).to.be.calledTwice
        expect(socketStub.emit.getCall(0)).to.be.calledWithExactly('submit-event', {
          event: Events.PAGE,
          attributes: {
            referrer: TEST_REFERRER,
          },
          url: TEST_JSDOM_URL,
        })
        expect(socketStub.emit.getCall(1)).to.be.calledWithExactly('submit-event', {
          event: Events.PAGE,
          attributes: {
            referrer: TEST_REFERRER,
          },
          url: TEST_JSDOM_URL + 'new',
        })
      })
    })

    describe('#_trackClicks', () => {
      it('does nothing if trackClicks is disabled', () => {
        const eventStub = sinon.stub(sdk, 'event')

        window.dispatchEvent(new window.Event('click'))

        expect(eventStub).to.not.have.been.called
      })

      it('report warning if event target is not element', () => {
        sdk['_trackClicks']()
        const reportStub = sinon.stub(sdk, '_report')
        window.dispatchEvent(new window.Event('click'))
        expect(reportStub).is.calledOnceWithExactly(
          'warning',
          'ArcxAnalyticsSdk::_trackClicks: event target is not Element',
        )
      })
    })

    describe('#_handleAccountConnected', () => {
      it('calls connectWallet with the correct params', async () => {
        sinon.stub(sdk, <any>'_getCurrentChainId').resolves(TEST_CHAIN_ID)
        const connectWalletStub = sinon.stub(sdk, 'wallet')

        expect(sdk.currentChainId).to.be.undefined
        await sdk['_handleAccountConnected'](TEST_ACCOUNT)
        expect(sdk.currentChainId).to.eq(TEST_CHAIN_ID)

        expect(connectWalletStub).calledOnceWithExactly({
          chainId: TEST_CHAIN_ID,
          account: TEST_ACCOUNT,
        })
      })
    })

    describe('#_reportCurrentWallet', () => {
      it('returns if the provider is non-existent', async () => {
        const requestStub = window.ethereum?.request
        const warnStub = sinon.stub(console, 'warn')

        sdk['_provider'] = undefined
        await sdk['_reportCurrentWallet']()

        expect(requestStub).to.not.have.been.called
        expect(warnStub).to.have.been.called
      })

      it('calls provider.request with eth_accounts', async () => {
        const provider = sdk.provider
        const requestStub = provider?.request

        await sdk['_reportCurrentWallet']()

        expect(requestStub).calledOnceWithExactly({ method: 'eth_accounts' })
      })

      it('does not call _handleAccountConnected if an account is returned', async () => {
        const handleAccountConnectedStub = sinon.stub(sdk, <any>'_handleAccountConnected')
        ;(window.ethereum?.request as any).resolves([])

        await sdk['_reportCurrentWallet']()

        expect(handleAccountConnectedStub).not.called
      })

      it('calls _handleAccountConnected if an account is returned', async () => {
        const handleAccountConnectedStub = sinon.stub(sdk, <any>'_handleAccountConnected')
        ;(window.ethereum?.request as any).resolves([TEST_ACCOUNT])

        await sdk['_reportCurrentWallet']()

        expect(handleAccountConnectedStub).calledOnceWithExactly(TEST_ACCOUNT)
      })
    })

    describe('#_getCurrentChainId', () => {
      it('throws if _provider is undefined', async () => {
        const originalEthereum = window.ethereum
        sdk['_provider'] = undefined

        try {
          await sdk['_getCurrentChainId']()
        } catch (err: any) {
          expect(err.message).to.eq('ArcxAnalyticsSdk::_getCurrentChainId: provider not set')
        }

        window.ethereum = originalEthereum
      })

      it('throws if no chain id is returned from ethereum.reqeust eth_chainId', async () => {
        const request: any = window.ethereum?.request
        request.resolves(undefined)

        try {
          await sdk['_getCurrentChainId']()
        } catch (err: any) {
          expect(err.message).to.eq(
            'ArcxAnalyticsSdk::_getCurrentChainId: chainIdHex is: undefined',
          )
        }
      })

      it('calls eth_chainId and returns a converted decimal chain id', async () => {
        const requestStub = (window.ethereum?.request as any).resolves('0x1')

        const chainId = await sdk['_getCurrentChainId']()

        expect(requestStub).calledOnceWithExactly({ method: 'eth_chainId' })
        expect(chainId).to.eq('1')
      })
    })

    describe('#_trackTransactions', () => {
      it('does not change request if provider is undefined', () => {
        sdk['_provider'] = undefined
        const reportErrorStub = sinon.stub(sdk, '_report')
        expect(sdk['_trackTransactions']()).to.be.false
        expect(reportErrorStub).to.be.calledOnce
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

        sdk = await ArcxAnalyticsSdk.init('', {
          ...ALL_FALSE_CONFIG,
          trackTransactions: true,
          initialProvider: window.web3.currentProvider,
        })
        const eventStub = sinon.stub(sdk, 'event')

        await window.web3.currentProvider!.request({
          method: 'eth_sendTransaction',
          params: [transactionParams],
        })
        expect(eventStub).calledWithExactly(Events.TRANSACTION_TRIGGERED, {
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
        sdk['_provider'] = undefined
        const reportErrorStub = sinon.stub(sdk, '_report')
        expect(sdk['_trackSigning']()).to.be.false
        expect(reportErrorStub).to.be.calledOnce
      })

      it('returns true if provider is not undefined', () => {
        expect(sdk.provider).to.not.be.undefined
        expect(sdk['_trackSigning']()).to.be.true
      })

      it('makes a Events.SIGNING_TRIGGERED event if personal_sign appears', async () => {
        const method = 'personal_sign'

        sdk['_trackSigning']()
        const eventStub = sinon.stub(sdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(Events.SIGNING_TRIGGERED, {
          account: params[1],
          messageToSign: params[0],
        })
      })

      it('makes a Events.SIGNING_TRIGGERED event if eth_sign appears', async () => {
        const method = 'eth_sign'

        sdk['_trackSigning']()
        const eventStub = sinon.stub(sdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(Events.SIGNING_TRIGGERED, {
          account: params[0],
          messageToSign: params[1],
        })
      })

      it('makes a Events.SIGNING_TRIGGERED event if signTypedData_v4 appears', async () => {
        const method = 'signTypedData_v4'

        sdk['_trackSigning']()
        const eventStub = sinon.stub(sdk, 'event')
        await window.ethereum!.request({ method, params })

        expect(eventStub).calledWithExactly(Events.SIGNING_TRIGGERED, {
          account: params[0],
          messageToSign: params[1],
        })
      })
    })
  })
})

function getAnalyticsData(event: string, attributes: any) {
  return {
    event,
    attributes,
    url: TEST_JSDOM_URL,
  }
}
