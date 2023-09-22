import { EIP1193Provider } from './eip1193'

export type CustomRequest = {
  method: string
  url: string
  event?: string
  attributes?: any
}

export interface ArcxAnalyticsSdk {
  provider?: EIP1193Provider
  identityId: string

  init: (apiKey: string, config?: any) => Promise<ArcxAnalyticsSdk>
  event: (event: string, attributes: any) => Promise<string>
  attribute: (attributes: any) => Promise<string>
  page: (attributes: any) => Promise<string>
  connectWallet: (attributes: any) => Promise<string>
  transaction: (attributes: {
    transactionHash: string
    account?: string
    chainId?: string | number
    metadata?: Record<string, unknown>
  }) => Promise<string>
  referrer: (referrer?: string) => Promise<string>
  setProvider: (provider: EIP1193Provider | undefined) => void
  _report: (logLevel: 'error' | 'log' | 'warning', content: string) => Promise<string>
}
