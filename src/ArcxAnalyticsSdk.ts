import { Account, Attributes, ChainID, SdkConfig, TransactionHash } from './types'
import {
  ATTRIBUTION_EVENT,
  CONNECT_EVENT,
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  IDENTITY_KEY,
  PAGE_EVENT,
  REFERRER_EVENT,
  TRANSACTION_EVENT,
} from './constants'
import { postRequest } from './helpers'

export class ArcxAnalyticsSdk {
  private currentUrl?: string

  private constructor(
    public readonly apiKey: string,
    public readonly identityId: string,
    private readonly sdkConfig: SdkConfig,
  ) {
    if (this.sdkConfig.trackPages) {
      this.trackPagesChanges()
    }
    if (this.sdkConfig.trackReferrer) {
      this.referrer()
    }
  }

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

  private trackPagesChanges() {
    const currentUrl = sessionStorage.getItem(CURRENT_URL_KEY)
    if (!currentUrl) {
      sessionStorage.setItem(CURRENT_URL_KEY, location.href)
      this.page({ url: location.href })
    }

    document.body.addEventListener(
      'click',
      () => {
        requestAnimationFrame(() => {
          if (currentUrl !== location.href) {
            sessionStorage.setItem(CURRENT_URL_KEY, location.href)
            this.page({ url: location.href })
          }
        })
      },
      true,
    )
  }

  /********************/
  /** PUBLIC METHODS **/
  /********************/

  /** Initialises the Analytics SDK with desired configuration. */
  static async init(apiKey: string, config?: Partial<SdkConfig>): Promise<ArcxAnalyticsSdk> {
    const sdkConfig = { ...DEFAULT_SDK_CONFIG, ...config }

    const identityId =
      (sdkConfig?.cacheIdentity && localStorage.getItem(IDENTITY_KEY)) ||
      (await postRequest(sdkConfig.url, apiKey, '/identify'))
    sdkConfig?.cacheIdentity && localStorage.setItem(IDENTITY_KEY, identityId)

    return new ArcxAnalyticsSdk(apiKey, identityId, sdkConfig)
  }

  /** Generic event logging method. Allows arbitrary events to be logged. */
  event(event: string, attributes?: Attributes): Promise<string> {
    return postRequest(this.sdkConfig.url, this.apiKey, '/submit-event', {
      identityId: this.identityId,
      event,
      attributes: { ...attributes },
    })
  }

  /**
   * Logs attribution information.
   *
   * @remark
   * You can optionally attribute either:
   * - the `source` that the traffic originated from (e.g. `discord`, `twitter`)
   * - the `medium`, defining the medium your visitors arrived at your site
   * (e.g. `social`, `email`)
   * - the `campaignId` if you wish to track a specific marketing campaign
   * (e.g. `bankless-podcast-1`, `discord-15`)
   */
  attribute(attributes: {
    source?: string
    medium?: string
    campaignId?: string
    [key: string]: unknown
  }): Promise<string> {
    return this.event(ATTRIBUTION_EVENT, attributes)
  }

  /** Logs page visit events. Only use this method is `trackPages` is set to `false`. */
  page(attributes: { url: string }): Promise<string> {
    return this.event(PAGE_EVENT, attributes)
  }

  /** Logs a wallet connect event. */
  connectWallet(attributes: { chain: ChainID; account: Account }): Promise<string> {
    return this.event(CONNECT_EVENT, attributes)
  }

  /** Logs an on-chain transaction made by an account. */
  transaction(attributes: {
    chain: ChainID
    transactionHash: TransactionHash
    metadata?: Record<string, unknown>
  }) {
    return this.event(TRANSACTION_EVENT, {
      chain: attributes.chain,
      transaction_hash: attributes.transactionHash,
      metadata: attributes.metadata || {},
    })
  }

  /** Logs an refferer of html page. */
  async referrer(referrer?: string) {
    return this.event(REFERRER_EVENT, { referrer: referrer || document.referrer })
  }
}
