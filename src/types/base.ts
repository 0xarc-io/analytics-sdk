/* eslint-disable @typescript-eslint/indent */
import { ReactNode } from 'react'

export type Attributes = Record<string, unknown>
export type ChainID = string | number

export const LIBRARY_USAGE_HEADER = 'X-Library-Usage'
export type LibraryUsageType = 'script-tag' | 'npm-package'

export type SdkConfig = {
  /* ---------------------------- Internal settings --------------------------- */
  cacheIdentity: boolean
  url: string

  /* ---------------------------- Tracking options ---------------------------- */
  trackPages: boolean
  trackWalletConnections: boolean
  trackChainChanges: boolean
  trackTransactions: boolean
  trackSigning: boolean
  trackClicks: boolean
}

export type ArcxAnalyticsProviderProps = {
  apiKey: string
  children?: ReactNode
  config?: Omit<
    Partial<SdkConfig>,
    | 'trackWalletConnections'
    | 'trackChainChanges'
    | 'trackTransactions'
    | 'trackSigning'
    | 'initialProvider'
  >
}
