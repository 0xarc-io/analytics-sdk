import { ArcxAnalyticsSdk } from '../src'
import { SdkConfig } from '../src/types'
import sinon from 'sinon'
import { expect } from 'chai'
import globalJsdom from 'global-jsdom'
import {
  CONNECT_EVENT,
  PAGE_EVENT,
  TRANSACTION_EVENT,
  DEFAULT_SDK_CONFIG,
  CURRENT_URL_KEY,
  REFERRER_EVENT,
  FIRST_PAGE_VISIT,
} from '../src/constants'
import * as postRequestModule from '../src/helpers/postRequest'

const PROD_URL_BACKEND = DEFAULT_SDK_CONFIG.url // Backwards compatability

const ALL_FALSE_CONFIG: SdkConfig = {
  cacheIdentity: false,
  trackPages: false,
  trackReferrer: false,
  trackUTM: false,
  url: PROD_URL_BACKEND,
}
const TEST_API_KEY = '01234'
const TEST_ATTRIBUTES = {
  a: 'value',
  b: 'second value',
}
const TEST_IDENTITY = 'test-identity'

describe('(unit) ArcxAnalyticsSdk', () => {
  let postRequestStub: sinon.SinonStub
  let analyticsSdk: ArcxAnalyticsSdk

  beforeEach(async () => {
    postRequestStub = sinon.stub(postRequestModule, 'postRequest').resolves(TEST_IDENTITY)
    analyticsSdk = await ArcxAnalyticsSdk.init(TEST_API_KEY, ALL_FALSE_CONFIG)
    sessionStorage.clear()
  })

  beforeEach(() => postRequestStub.resetHistory())

  afterEach(() => sinon.restore())

  describe('#init', () => {
    it('posts identify', async () => {
      await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)
      expect(postRequestStub.calledOnceWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
    })

    it('sets the current URL in the session storage when tracking pages', async () => {
      expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.be.null
      globalJsdom('', {
        url: 'https://arcx.money',
      })
      expect(window.location.href).to.eq('https://arcx.money/')

      await ArcxAnalyticsSdk.init('', { trackPages: true })

      expect(sessionStorage.getItem(CURRENT_URL_KEY)).to.eq('https://arcx.money/')
      globalJsdom()
    })

    it('makes an initial FIRST_PAGE_VISIT call url, utm and referrer if using the default config', async () => {
      const url = 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand'

      globalJsdom('', {
        url,
        referrer: 'https://arcx.money',
      })

      await ArcxAnalyticsSdk.init('', { cacheIdentity: false })
      expect(postRequestStub.getCall(0).calledWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
      expect(
        postRequestStub.getCall(1).calledWith(PROD_URL_BACKEND, '', '/submit-event', {
          identityId: TEST_IDENTITY,
          event: FIRST_PAGE_VISIT,
          attributes: {
            url,
            referrer: 'https://arcx.money/',
            utm: {
              source: 'google',
              medium: 'cpc',
              campaign: 'brand',
            },
          },
        }),
      ).to.be.true

      globalJsdom()
    })

    it('does not make a FIRST_PAGE_VISIT call if trackPages, referrer and UTM configs are set to false', async () => {
      await ArcxAnalyticsSdk.init('', ALL_FALSE_CONFIG)

      expect(postRequestStub.callCount).to.eq(1)
      expect(postRequestStub.getCall(0).calledWith(PROD_URL_BACKEND, '', '/identify')).to.be.true
    })

    it('does not include the UTM object if trackUTM is set to false', async () => {
      const url = 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand'
      globalJsdom('', {
        url,
        referrer: 'https://arcx.money',
      })

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
            url,
          },
        }),
      ).to.be.true

      globalJsdom()
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

    await analyticsSdk.referrer('https://arcx.money')
    expect(eventStub.calledOnceWith(REFERRER_EVENT, { referrer: 'https://arcx.money' })).to.be.true
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

function getAnalyticsData(event: string, attributes: any) {
  return {
    identityId: TEST_IDENTITY,
    event,
    attributes,
  }
}
