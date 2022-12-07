export type CustomRequest = {
  method: string
  url: string
  event?: string
  attributes?: any
}

export interface ArcxAnalyticsSdk {
  identityId: string

  init: (apiKey: string, config?: any) => Promise<ArcxAnalyticsSdk>
  event: (event: string, attributes: any) => Promise<string>
  attribute: (attributes: any) => Promise<string>
  page: (attributes: any) => Promise<string>
  connectWallet: (attributes: any) => Promise<string>
  transaction: (attributes: any) => Promise<string>
  referrer: (referrer?: string) => Promise<string>
}
