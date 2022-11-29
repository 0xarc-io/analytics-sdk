import { SdkConfig } from '../src/types/types'
import sinon from 'sinon'
import { expect } from 'chai'
import {
  CONNECT_EVENT,
  PAGE_EVENT,
  TRANSACTION_EVENT,
  DEFAULT_SDK_CONFIG,
  CURRENT_URL_KEY,
  REFERRER_EVENT,
  FIRST_PAGE_VISIT,
  DISCONNECT_EVENT,
  CHAIN_CHANGED_EVENT,
} from '../src/constants'
import * as postRequestModule from '../src/helpers/postRequest'
import {
  TEST_JSDOM_URL,
  TEST_REFERRER,
  TEST_UTM_CAMPAIGN,
  TEST_UTM_MEDIUM,
  TEST_UTM_SOURCE,
} from './jsdom.setup.test'
import { TEST_ADDRESS, TEST_CHAIN_ID, TEST_IDENTITY } from './fixture'
import { MockEthereum } from './MockEthereum'
import { ArcxAnalyticsSdk } from '../src'

const PROD_URL_BACKEND = DEFAULT_SDK_CONFIG.url // Backwards compatability

const ALL_FALSE_CONFIG: SdkConfig = {
  cacheIdentity: false,
  trackPages: false,
  trackReferrer: false,
  trackUTM: false,
  trackWalletConnections: false,
  trackChainChanges: false,
  url: PROD_URL_BACKEND,
}
const TEST_API_KEY = '01234'
const TEST_ATTRIBUTES = {
  a: 'value',
  b: 'second value',
}

describe('(unit) ArcxAnalyticsSdk', () => {
  describe('Base functionality', () => {
    let postRequestStub: sinon.SinonStub
    let analyticsSdk: ArcxAnalyticsSdk

    beforeEach(async () => {
      postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)
      analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
      postRequestStub.resetHistory()
      sessionStorage.clear()
    })

    afterEach(() => sinon.restore())

    describe('#init', () => {
      it('posts identify', async () => {
        await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)
        expect(postRequestStub.calledOnceWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
      })

      it('sets the current URL in the session storage when tracking pages', async () => {
        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null
        expect(window.location.href).to.eq(TEST_JSDOM_URL)

        await ArcxAnalyticsSdk.init('', { trackPages: true })

        expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq(TEST_JSDOM_URL)
      })

      it('makes an initial FIRST_PAGE_VISIT call url, utm and referrer if using the default config', async () => {
        await ArcxAnalyticsSdk.init('', { cacheIdentity: false })
        expect(postRequestStub.getCall(0).calledWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
        expect(
          postRequestStub.getCall(1).calledWith(PROD_URL_BACKEND, '', '/submit-event', {
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
          }),
        ).to.be.true
      })

      it('does not make a FIRST_PAGE_VISIT call if trackPages, referrer and UTM configs are set to false', async () => {
        await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)

        expect(postRequestStub.callCount).to.eq(1)
        expect(postRequestStub.getCall(0).calledWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
      })

      it('does not include the UTM object if trackUTM is set to false', async () => {
        await ArcxAnalyticsSdk.init('', {
          ...ALL_FALSE_CONFIG,
          trackPages: true,
        })
        expect(postRequestStub.getCall(0).calledWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
        expect(
          postRequestStub.getCall(1).calledWith(PROD_URL_BACKEND, '', '/submit-event', {
            identityId: TEST_IDENTITY,
            event: FIRST_PAGE_VISIT,
            attributes: {
              url: TEST_JSDOM_URL,
            },
          }),
        ).to.be.true
      })

      it('calls _reportCurrentWallet if trackWalletConnections is true', async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(window as any).ethereum = new MockEthereum()

        const reportCurrentWalletStub = sinon.stub(
          ArcxAnalyticsSdk.prototype,
          <any>'_reportCurrentWallet',
        )
        await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

        expect(reportCurrentWalletStub.calledOnce).to.be.true
      })
    })

    it('#event', async () => {
      await analyticsSdk.event('TEST_EVENT', TEST_ATTRIBUTES)
      expect(
        postRequestStub.calledOnceWith(
          PROD_URL_BACKEND,
          TEST_API_KEY,
          '/submit-event',
          getAnalyticsData('TEST_EVENT', TEST_ATTRIBUTES),
        ),
      ).to.be.true
    })

    it('#page', async () => {
      const pageAttributes = { url: 'page.test' }
      const eventStub = sinon.stub(analyticsSdk, 'event')

      await analyticsSdk.page(pageAttributes)

      expect(eventStub.calledOnceWith(PAGE_EVENT, pageAttributes)).to.be.true
    })

    it('#connectWallet', async () => {
      const attributes = { account: '0x12354', chain: '1' }
      const eventStub = sinon.stub(analyticsSdk, 'event')

      await analyticsSdk.connectWallet(attributes)

      expect(eventStub.calledOnceWith(CONNECT_EVENT, attributes)).to.be.true
    })

    it('#referrer', async () => {
      const eventStub = sinon.stub(analyticsSdk, 'event')

      await analyticsSdk.referrer('https://test.site')
      expect(eventStub.calledOnceWith(REFERRER_EVENT, { referrer: 'https://test.site' })).to.be.true
    })

    describe('#transaction', async () => {
      const attributes = {
        chain: '1',
        transactionHash: '0x123456789',
        metadata: { timestamp: '123456' },
      }

      let eventStub: sinon.SinonStub

      beforeEach(() => {
        eventStub = sinon.stub(analyticsSdk, 'event')
      })

      it('all parameters are passed', async () => {
        await analyticsSdk.transaction(attributes)

        expect(
          eventStub.calledOnceWith(TRANSACTION_EVENT, {
            chain: attributes.chain,
            transaction_hash: attributes.transactionHash,
            metadata: attributes.metadata,
          }),
        ).to.be.true
      })
    })

    it('super nested attributes are supported', async () => {
      const pageAttributes = { layer1: { layer2: { layer3: { layer4: 'hello!' } } } }
      const eventStub = sinon.stub(analyticsSdk, 'event')

      await analyticsSdk.event('TEST_EVENT', pageAttributes)

      expect(eventStub.calledOnceWith('TEST_EVENT', pageAttributes)).to.be.true
    })
  })

  describe('Automatic Metamask event reporting', () => {
    let ethereum: MockEthereum
    let requestStub: sinon.SinonStub
    let analyticsSdk: ArcxAnalyticsSdk

    beforeEach(async () => {
      requestStub = sinon.stub()
      requestStub.withArgs({ method: 'eth_accounts' }).resolves([TEST_ADDRESS])
      requestStub.withArgs({ method: 'eth_chainId' }).resolves('0x1')

      sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)

      ethereum = new MockEthereum()
      ethereum.request = requestStub
      ;(window as any).ethereum = ethereum

      analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, {
        trackWalletConnections: true,
      })

      sinon.resetHistory()
    })

    afterEach(sinon.restore)

    after(() => delete (window as any).ethereum)

    it('does not call _onAccountsChanged if trackWalletConnections is false', async () => {
      await ethereum.removeAllListeners()
      const stub = sinon.stub(ArcxAnalyticsSdk.prototype, <any>'_onAccountsChanged').resolves()
      await ArcxAnalyticsSdk.init(TEST_API_KEY, {
        ...DEFAULT_SDK_CONFIG,
        trackWalletConnections: false,
      })

      ethereum.emit('accountsChanged', [TEST_ADDRESS])
      expect(stub.notCalled).to.be.true
    })

    it('does not call _onChainChanged if trackChainChanges is false', async () => {
      await ethereum.removeAllListeners()
      const stub = sinon.stub(ArcxAnalyticsSdk.prototype, <any>'_onChainChanged').resolves()
      await ArcxAnalyticsSdk.init(TEST_API_KEY, {
        ...DEFAULT_SDK_CONFIG,
        trackChainChanges: false,
      })

      ethereum.emit('chainChanged', '21')
      expect(stub.notCalled).to.be.true
    })

    it('calls _onAccountsChanged listener', async () => {
      await ethereum.removeAllListeners()
      const stub = sinon.stub(ArcxAnalyticsSdk.prototype, <any>'_onAccountsChanged').resolves()
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

      ethereum.emit('accountsChanged', [TEST_ADDRESS])
      expect(stub.calledOnceWith([TEST_ADDRESS])).to.be.true
    })

    it('calls _onChainChanged listener', async () => {
      const onChainChangedStub = sinon.stub(ArcxAnalyticsSdk.prototype, <any>'_onChainChanged')
      await ethereum.removeAllListeners()
      await ArcxAnalyticsSdk.init(TEST_API_KEY, { trackWalletConnections: true })

      ethereum.emit('chainChanged', '21')
      expect(onChainChangedStub.calledOnceWith('21')).to.be.true
    })

    // This is the same event being fired wether the user switches the account or connects it
    it('#_onAccountsChanged: calls #connectWallet if trackWalletConnections is set to true and user connects wallet', async () => {
      const connectWalletStub = sinon.stub(analyticsSdk, 'connectWallet')
      analyticsSdk.previousConnectedAccount = undefined
      analyticsSdk.previousChainId = undefined

      await analyticsSdk['_onAccountsChanged']([TEST_ADDRESS])

      expect(analyticsSdk.previousConnectedAccount).to.equal(TEST_ADDRESS)
      expect(analyticsSdk.previousConnectedAccount).to.equal(TEST_ADDRESS)

      expect(requestStub.calledOnceWith({ method: 'eth_chainId' })).to.be.true
      expect(connectWalletStub).to.have.been.calledOnceWith({
        chain: TEST_CHAIN_ID,
        account: TEST_ADDRESS,
      })
    })

    it('#_onAccountsChanged: does not call #connectWallet if the same event was already reported once', async () => {
      expect(analyticsSdk.previousConnectedAccount).to.be.equal(TEST_ADDRESS)
      const connectWalletStub = sinon.stub(analyticsSdk, 'connectWallet')

      await analyticsSdk['_onAccountsChanged']([TEST_ADDRESS])

      expect(connectWalletStub.notCalled).to.be.true
    })

    it('reports a DISCONNECT event if trackWalletConnections is set to true and user disconnects wallet', async () => {
      const eventStub = sinon.stub(analyticsSdk, 'event')
      await analyticsSdk['_onAccountsChanged']([])

      expect(eventStub).to.have.been.calledOnceWithExactly(DISCONNECT_EVENT, {
        chain: TEST_CHAIN_ID,
        account: TEST_ADDRESS,
      })
    })

    it('reports a CHAIN_CHANGED_EVENT event if the chain has changed', async () => {
      const eventStub = sinon.stub(analyticsSdk, 'event')
      await analyticsSdk['_onChainChanged']('0x1')

      expect(eventStub).to.have.been.calledOnceWithExactly(CHAIN_CHANGED_EVENT, {
        chainId: '1',
      })
    })

    describe('#_reportCurrentWallet', () => {
      it('calls #connectWallet', async () => {
        const connectWalletStub = sinon.stub(analyticsSdk, 'connectWallet')

        await analyticsSdk['_reportCurrentWallet']()

        expect(requestStub.firstCall.calledWith({ method: 'eth_accounts' })).to.be.true
        expect(requestStub.secondCall.calledWith({ method: 'eth_chainId' })).to.be.true
        expect(connectWalletStub).to.have.been.calledOnceWith({
          account: TEST_ADDRESS,
          chain: TEST_CHAIN_ID,
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
