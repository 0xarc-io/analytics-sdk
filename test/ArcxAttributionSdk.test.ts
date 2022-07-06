import { ArcxAttributionSdk } from '../src'
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

describe('(unit) ArcxAttributionSdk', () => {
  let postAttributionStub: sinon.SinonStub
  let attributionSdk: ArcxAttributionSdk

  beforeEach(async () => {
    postAttributionStub = sinon.stub(ArcxAttributionSdk, 'postAttribution').resolves(TEST_IDENTITY)
    attributionSdk = await ArcxAttributionSdk.init(TEST_API_KEY, TEST_CONFIG)

    postAttributionStub.resetHistory()
  })

  it('#init', async () => {
    await ArcxAttributionSdk.init('', TEST_CONFIG)
    expect(postAttributionStub.calledOnce).to.be.true
  })

  it('#event', async () => {
    await attributionSdk.event('TEST_EVENT', TEST_ATTRIBUTES)
    expect(
      postAttributionStub.calledOnceWith(
        PROD_URL_BACKEND,
        TEST_API_KEY,
        '/submit-event',
        getAttributionData('TEST_EVENT', TEST_ATTRIBUTES),
      ),
    ).to.be.true
  })

  it('#page', async () => {
    const pageAttributes = { url: 'page.test' }
    const eventStub = sinon.stub(attributionSdk, 'event')

    await attributionSdk.page(pageAttributes)

    expect(eventStub.calledOnceWith(PAGE_EVENT, pageAttributes)).to.be.true
  })

  it('#connectWallet', async () => {
    const attributes = { account: '0x12354', chain: '1' }
    const eventStub = sinon.stub(attributionSdk, 'event')

    await attributionSdk.connectWallet(attributes)

    expect(eventStub.calledOnceWith(CONNECT_EVENT, attributes)).to.be.true
  })

  describe('#transaction', async () => {
    const attributes = { timestamp: '123456', chain: '1' }
    const transactionHash = '0x123456789'
    const transactionType = 'SWAP'
    let eventStub: sinon.SinonStub

    beforeEach(() => {
      eventStub = sinon.stub(attributionSdk, 'event')
    })

    it('all parameters are passed', async () => {
      await attributionSdk.transaction(transactionType, transactionHash, attributes)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
          transaction_hash: transactionHash,
          ...attributes,
        }),
      ).to.be.true
    })

    it('none optional parameters are passed', async () => {
      await attributionSdk.transaction(transactionType)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
        }),
      ).to.be.true
    })

    it('only transaction hash is passed', async () => {
      await attributionSdk.transaction(transactionType, transactionHash)

      expect(
        eventStub.calledOnceWith(TRANSACTION_EVENT, {
          type: transactionType,
          transaction_hash: transactionHash,
        }),
      ).to.be.true
    })

    it('only attributes is passed', async () => {
      await attributionSdk.transaction(transactionType, undefined, attributes)

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

function getAttributionData(event: string, attributes: any) {
  return {
    identityId: TEST_IDENTITY,
    event,
    attributes,
  }
}
