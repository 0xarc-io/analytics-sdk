/**
 * NOTE: I don't get the point of these tests. They are kinda pointless IMO.
 * It would be better to check the _information_ and _structure_ of the
 * submitted events, not that they returned true.
 */

import { ArcxAnalyticsSdk } from '../src'
import { SdkConfig } from '../src/types'
import sinon from 'sinon'
import { expect } from 'chai'
import { CONNECT_EVENT, PAGE_EVENT, TRANSACTION_EVENT, DEFAULT_SDK_CONFIG } from '../src/constants'

const PROD_URL_BACKEND = DEFAULT_SDK_CONFIG.url // Backwards compatability

const TEST_CONFIG: SdkConfig = {
  cacheIdentity: false,
  trackPages: false,
  trackReferrer: false,
  url: PROD_URL_BACKEND,
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
