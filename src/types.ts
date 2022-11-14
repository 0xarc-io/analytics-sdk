declare global {
  interface Window {
    url?: string
  }
}

export type Attributes = Record<string, unknown>
export type ChainID = string | number
export type Account = string
export type TransactionHash = string

export type SdkConfig = {
  cacheIdentity: boolean
  trackPages: boolean
  trackReferrer: boolean
  url: string
}
