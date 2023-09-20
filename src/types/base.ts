import { ReactNode } from 'react'
import { EIP1193Provider } from './web3'

export type Attributes = Record<string, unknown>
export type ChainID = string | number

export type SdkConfig = {
  /* ---------------------------- Internal settings --------------------------- */
  cacheIdentity: boolean
  url: string
  initialProvider?: EIP1193Provider

  /* ---------------------------- Tracking options ---------------------------- */
  trackPages: boolean
  trackWalletConnections: boolean
  trackTransactions: boolean
  trackSigning: boolean
  trackClicks: boolean
}

export type ArcxAnalyticsProviderProps = {
  apiKey: string
  children?: ReactNode
  config?: Partial<SdkConfig>
}
