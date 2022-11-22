import { Account, Attributes, ChainID, SdkConfig, TransactionHash } from './types'
import {
  ATTRIBUTION_EVENT,
  CONNECT_EVENT,
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  FIRST_PAGE_VISIT,
  IDENTITY_KEY,
  PAGE_EVENT,
  REFERRER_EVENT,
  TRANSACTION_EVENT,
} from './constants'
import { postRequest } from './helpers'

export class ArcxAnalyticsSdk {
  private constructor(
    public readonly apiKey: string,
    public readonly identityId: string,
    private readonly sdkConfig: SdkConfig,
  ) {
    if (sdkConfig.trackPages || sdkConfig.trackReferrer || sdkConfig.trackUTM) {
      this._trackFirstPageVisit()
    }

    if (this.sdkConfig.trackPages) {
      this.trackPagesChanges()
    }
  }

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

  private _trackFirstPageVisit() {
    // If no tracking is set, this function shouldn't have been called
    if (!this.sdkConfig.trackPages && !this.sdkConfig.trackReferrer && !this.sdkConfig.trackUTM) {
      throw new Error('ArcxAnalyticsSdk::_trackFirstPageVisit: No tracking is set')
    }

    const attributes: {
      url?: string
      referrer?: string
      utm?: {
        source?: string
        medium?: string
        campaign?: string
      }
    } = {}

    if (this.sdkConfig.trackPages) {
      attributes.url = window.location.href
      if (sessionStorage.getItem(CURRENT_URL_KEY) === null) {
        sessionStorage.setItem(CURRENT_URL_KEY, window.location.href)
      }
    }

    if (this.sdkConfig.trackReferrer) {
      attributes.referrer = document.referrer
    }

    if (this.sdkConfig.trackUTM) {
      const searchParams = new URLSearchParams(window.location.search)
      const source = searchParams.get('utm_source')
      const medium = searchParams.get('utm_medium')
      const campaign = searchParams.get('utm_campaign')

      if (source || medium || campaign) {
        attributes.utm = {
          ...(source && { source }),
          ...(medium && { medium }),
          ...(campaign && { campaign }),
        }
      }
    }

    return this.event(FIRST_PAGE_VISIT, attributes)
  }

  private trackPagesChanges() {
    document.body.addEventListener(
      'click',
      () => {
        requestAnimationFrame(() => {
          const currentUrl = sessionStorage.getItem(CURRENT_URL_KEY)

          if (currentUrl !== window.location.href) {
            sessionStorage.setItem(CURRENT_URL_KEY, window.location.href)
            this.page({ url: window.location.href })
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
   * - the `campaign` if you wish to track a specific marketing campaign
   * (e.g. `bankless-podcast-1`, `discord-15`)
   */
  attribute(attributes: {
    source?: string
    medium?: string
    campaign?: string
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
  async referrer(
    referrer?: string,
    utms?: { source?: string; medium?: string; campaign?: string },
  ) {
    return this.event(REFERRER_EVENT, {
      referrer: referrer,
      ...utms,
    })
  }
}
