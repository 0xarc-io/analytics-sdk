export type Attributes = Record<string, string | number | Record<string, string | number>>

export type SdkConfig = {
  trackPages: boolean,
  cacheIdentity: boolean,
}
