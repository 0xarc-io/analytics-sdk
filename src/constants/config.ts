import { SdkConfig } from '../types'

export const DEFAULT_SDK_CONFIG: SdkConfig = {
  cacheIdentity: true,
  trackPages: true,
  trackReferrer: true,
  trackUTM: true,
  trackWalletConnections: true,
  trackChainChanges: true,
  trackTransactions: true,
  url: 'https://api.arcx.money/v1',
}

export const IDENTITY_KEY = 'identity'
export const CURRENT_URL_KEY = 'arcx-analytics-current-url'
