import { cast, asString } from '@restless/sanitizers'
import { CONNECT_EVENT, DEFAULT_SDK_CONFIG, IDENTITY_KEY, PAGE_EVENT, PROD_URL_BACKEND, TRANSACTION_EVENT } from './constants'
import { Attributes, SdkConfig } from './types'

export class ArcxAnalyticsSdk {
  private constructor(
    public readonly apiKey: string,
    public readonly identityId: string,
    private readonly arcxUrl: string,
    private readonly sdkConfig: SdkConfig,
  ) {
    if (this.sdkConfig.trackPages) {
      this.trackPagesChanges()
    }
  }

  private trackPagesChanges() {
    document.body.addEventListener('click', () => {
      requestAnimationFrame(() => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if ((window as any).url !== location.href) {
          (window as any).url = location.href
          this.page({ url: (window as any).url })
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      })
    }, true)
  }

  static async init(apiKey: string, config?: SdkConfig, arcxUrl = PROD_URL_BACKEND): Promise<ArcxAnalyticsSdk> {
    const sdkConfig = { ...DEFAULT_SDK_CONFIG, ...config }

    const identityId = (sdkConfig?.cacheIdentity && localStorage.getItem(IDENTITY_KEY)) || await this.postAnalytics(arcxUrl, apiKey, '/init')

    sdkConfig?.cacheIdentity && localStorage.setItem(IDENTITY_KEY, identityId)

    return new ArcxAnalyticsSdk(apiKey, identityId, arcxUrl, sdkConfig)
  }

  event(event: string, attributes?: Attributes): Promise<string> {
    return ArcxAnalyticsSdk.postAnalytics(this.arcxUrl, this.apiKey, '/submit-event', {
      identityId: this.identityId,
      event,
      attributes: { ...attributes },
    })
  }

  page(attributes: { url: string }): Promise<string> {
    return this.event(PAGE_EVENT, attributes)
  }

  connectWallet(attributes: { account: string, chain: string | number }): Promise<string> {
    return this.event(CONNECT_EVENT, attributes)
  }

  transaction(transactionType: string, transactionHash?: string, attributes?: Attributes): Promise<string> {
    const _attributes: Attributes = {
      type: transactionType,
      ...attributes,
    }
    if (transactionHash) {
      _attributes.transaction_hash = transactionHash
    }
    return this.event(TRANSACTION_EVENT, _attributes)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async postAnalytics(arcxUrl: string, apiKey: string, path: string, data?: any): Promise<string> {
    const response = await fetch(`${arcxUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(data),
    })
    const body = await response.json()
    return cast(body, asString)
  }
}
