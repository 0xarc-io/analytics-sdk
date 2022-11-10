import { ReactNode } from 'react'

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

export type ArcxAnalyticsProviderProps = {
  apiKey: string
  children?: ReactNode
  config?: Partial<SdkConfig>
}
