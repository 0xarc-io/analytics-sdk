import { ArcxAnalyticsSdk } from '../src'
import { SdkConfig } from '../src/types'
import sinon from 'sinon'
import { expect } from 'chai'
import { CONNECT_EVENT, PAGE_EVENT, PROD_URL_BACKEND, TRANSACTION_EVENT } from '../src/constants'

const TEST_CONFIG: SdkConfig = {
  trackPages: false,
  cacheIdentity: false,
}
const TEST_API_KEY = '01234'
const TEST_ATTRIBUTES = {
  a: 'value',
  b: 'second value',
}
const TEST_IDENTITY = 'ef9a0cb5f45edf8d0a9ce7f7'

describe('(unit) ArcxAnalyticsSdk', () => {
  let postAnalyticsStub: sinon.SinonStub
  let analyticsSdk: ArcxAnalyticsSdk

  beforeEach(async () => {
    postAnalyticsStub = sinon.stub(ArcxAnalyticsSdk, 'postAnalytics').resolves(TEST_IDENTITY)
    analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, TEST_CONFIG)

    postAnalyticsStub.resetHistory()
  })

  it('#init', async () => {
    await ArcxAnalyticsSdk.init('', TEST_CONFIG)
    expect(postAnalyticsStub.calledOnce).to.be.true
  })

  it('#event', async () => {
    await analyticsSdk.event('TEST_EVENT', TEST_ATTRIBUTES)
    expect(
      postAnalyticsStub.calledOnceWith(
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

  describe('#transaction', async () => {
    const attributes = { timestamp: '123456', chain: '1' }
    const transactionHash = '0x123456789'
    const transactionType = 'SWAP'
    let eventStub: sinon.SinonStub

    beforeEach(() => {
      eventStub = sinon.stub(analyticsSdk, 'event')
    })

    it('all parameters are passed', async () => {
      await analyticsSdk.transaction(transactionType, transactionHash, attributes)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
          transaction_hash: transactionHash,
          ...attributes,
        }),
      ).to.be.true
    })

    it('none optional parameters are passed', async () => {
      await analyticsSdk.transaction(transactionType)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
        }),
      ).to.be.true
    })

    it('only transaction hash is passed', async () => {
      await analyticsSdk.transaction(transactionType, transactionHash)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
          transaction_hash: transactionHash,
        }),
      ).to.be.true
    })

    it('only attributes is passed', async () => {
      await analyticsSdk.transaction(transactionType, undefined, attributes)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
          ...attributes,
        }),
      ).to.be.true
    })
  })

  afterEach(() => {
    sinon.restore()
  })
})

function getAnalyticsData(event: string, attributes: any) {
  return {
    identityId: TEST_IDENTITY,
    event,
    attributes,
  }
}
