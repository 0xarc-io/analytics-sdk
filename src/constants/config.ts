import { SdkConfig } from '../types'

export const DEFAULT_SDK_CONFIG: SdkConfig = {
  cacheIdentity: true,
  trackPages: true,
  trackWalletConnections: true,
  trackChainChanges: true,
  trackTransactions: true,
  trackSigning: true,
  trackClicks: true,
  // TODO: Add back in once GCP Certificates are fixed (potentially linked to CrowdStrike)
  // url: 'https://prod.clickstream.api.0xarc.io/v1',
  url: 'https://prod.analytics.api.arcx.money/v1',
}

export const IDENTITY_KEY = '0xArc-identity'
export const SESSION_STORAGE_ID_KEY = '0xArc-session-id'
export const CURRENT_URL_KEY = '0xArc-analytics-current-url'
export const SDK_VERSION = 'local'
