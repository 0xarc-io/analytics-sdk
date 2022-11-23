import globalJsdom from 'global-jsdom'

export const TEST_REFERRER = 'https://arcx.money/'
export const TEST_UTM_SOURCE = 'facebook'
export const TEST_UTM_MEDIUM = 'cpc'
export const TEST_UTM_CAMPAIGN = 'ad-camp'
export const TEST_JSDOM_URL = `https://example.com/?utm_source=${TEST_UTM_SOURCE}&utm_medium=${TEST_UTM_MEDIUM}&utm_campaign=${TEST_UTM_CAMPAIGN}`

let cleanup: () => void

before(() => {
  cleanup = globalJsdom('', {
    url: TEST_JSDOM_URL,
    referrer: TEST_REFERRER,
  })
})

after(() => cleanup())
