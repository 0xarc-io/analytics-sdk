import { ArcxAnalyticsSdk } from './types'

declare global {
  interface Window {
    arcx?: ArcxAnalyticsSdk
  }
}
