import { SdkConfig } from '../types'

export const DEFAULT_SDK_CONFIG: SdkConfig = {
  cacheIdentity: true,
  trackPages: true,
  trackWalletConnections: true,
  trackTransactions: true,
  trackSigning: true,
  trackClicks: true,
  url: 'https://prod.analytics.api.arcx.money/v1',
}

export const IDENTITY_KEY = 'identity'
export const CURRENT_URL_KEY = 'arcx-analytics-current-url'
export const SDK_VERSION = 'local'
