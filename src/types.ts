export type Attributes = Record<string, string | number | Record<string, string | number>>
export type ChainID = string | number
export type Account = string
export type TransactionHash = string

export type SdkConfig = {
  cacheIdentity: boolean,
  trackPages: boolean,
  trackReferrer: boolean,
  url: string,
}
