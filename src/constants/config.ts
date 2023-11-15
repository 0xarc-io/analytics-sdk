import { SdkConfig } from '../types'

export const DEFAULT_SDK_CONFIG: SdkConfig = {
  cacheIdentity: true,
  trackPages: true,
  trackWalletConnections: true,
  trackChainChanges: true,
  trackTransactions: true,
  trackSigning: true,
  trackClicks: true,
  url: 'https://prod.analytics.api.arcx.money/v1',
}

export const IDENTITY_KEY = 'identity'
export const SESSION_STORAGE_ID_KEY = 'arcx-session-id'
export const CURRENT_URL_KEY = 'arcx-analytics-current-url'
export const SDK_VERSION = '2.0.0'
