import { SdkConfig } from '../types'

export const DEFAULT_SDK_CONFIG: SdkConfig = {
  cacheIdentity: true,
  trackPages: true,
  trackReferrer: true,
  url: 'https://api.arcx.money/v1',
}

export const IDENTITY_KEY = 'identity'
