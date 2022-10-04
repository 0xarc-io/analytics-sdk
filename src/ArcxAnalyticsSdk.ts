import { cast, asString } from '@restless/sanitizers'
import { ATTRIBUTION_EVENT, CONNECT_EVENT, DEFAULT_SDK_CONFIG, IDENTITY_KEY, PAGE_EVENT, PROD_URL_BACKEND, TRANSACTION_EVENT } from './constants'
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

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

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

  /********************/
  /** PUBLIC METHODS **/
  /********************/

  /** Initialises the Analytics SDK with desired configuration. */
  static async init(apiKey: string, config?: SdkConfig, arcxUrl = PROD_URL_BACKEND): Promise<ArcxAnalyticsSdk> {
    const sdkConfig = { ...DEFAULT_SDK_CONFIG, ...config }

    const identityId = (sdkConfig?.cacheIdentity && localStorage.getItem(IDENTITY_KEY)) || await this.postAnalytics(arcxUrl, apiKey, '/identify')

    sdkConfig?.cacheIdentity && localStorage.setItem(IDENTITY_KEY, identityId)

    return new ArcxAnalyticsSdk(apiKey, identityId, arcxUrl, sdkConfig)
  }

  /** Generic event logging method. Allows arbitrary events to be logged. */
  event(event: string, attributes?: Attributes): Promise<string> {
    return ArcxAnalyticsSdk.postAnalytics(this.arcxUrl, this.apiKey, '/submit-event', {
      identityId: this.identityId,
      event,
      attributes: { ...attributes },
    })
  }

  /**
   * Logs attribution information. In particular, channel and campaign origination.
   *
   * @remark
   * You can optionally attribute either the `channel` that the traffic originated
   * from (e.g. `discord`, `twitter`) or a `campaignId` if you wish to track a
   * specific marketing campaign (e.g. `bankless-podcast-1`, `discord-15`).
   */
  attribute(attributes: { channel?: string, campaignId?: string }): Promise<string> {
    return this.event(ATTRIBUTION_EVENT, attributes)
  }

  /** Logs page visit events. Only use this method is `trackPages` is set to `false`. */
  page(attributes: { url: string }): Promise<string> {
    return this.event(PAGE_EVENT, attributes)
  }

  /** Logs a wallet connect event. */
  connectWallet(attributes: { account: string, chain: string | number }): Promise<string> {
    return this.event(CONNECT_EVENT, attributes)
  }

  /** Logs an on-chain transaction made by an account. */
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
}
