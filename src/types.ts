export type Attributes = Record<string, any>
export type ChainID = string | number
export type Account = string
export type TransactionHash = string

export type SdkConfig = {
  cacheIdentity: boolean,
  trackPages: boolean,
  trackReferrer: boolean,
  url: string,
}
