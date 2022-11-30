import globalJsdom from 'global-jsdom'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { TEST_JSDOM_URL, TEST_REFERRER } from './fixture'

chai.use(sinonChai)

let cleanup: () => void

exports.mochaHooks = {
  beforeEach() {
    cleanup = globalJsdom('', {
      url: TEST_JSDOM_URL,
      referrer: TEST_REFERRER,
    })
  },

  afterEach() {
    cleanup()
  },
}
