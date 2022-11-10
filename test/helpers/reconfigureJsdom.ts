import { JSDOM, ReconfigureSettings } from 'jsdom'

export function reconfigureJsdom(settings: ReconfigureSettings) {
  const jsdom: JSDOM = (global as any).$jsdom
  jsdom.reconfigure(settings)
}
