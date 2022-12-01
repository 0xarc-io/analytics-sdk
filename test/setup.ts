import chai from 'chai'
import globalJsdom from 'global-jsdom'
import sinonChai from 'sinon-chai'
import { TEST_JSDOM_URL, TEST_REFERRER } from './fixture'

chai.use(sinonChai)

exports.mochaHooks = {
  beforeAll() {
    this.cleanup = globalJsdom(undefined, {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })
  },

  afterAll() {
    this.cleanup()
  },
}
