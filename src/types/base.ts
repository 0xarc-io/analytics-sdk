/* eslint-disable @typescript-eslint/indent */
import { ReactNode } from 'react'

export type Attributes = Record<string, unknown>
export type ChainID = string | number

export const LIBRARY_USAGE_HEADER = 'X-Library-Usage'
export type LibraryType = 'script-tag' | 'npm-package'

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
  /**
   * If you want to disable analytics for a specific environment, you can do so by setting this prop
   * to true.
   */
  disabled?: boolean
  config?: Omit<
    Partial<SdkConfig>,
    | 'trackWalletConnections'
    | 'trackChainChanges'
    | 'trackTransactions'
    | 'trackSigning'
    | 'initialProvider'
  >
}
