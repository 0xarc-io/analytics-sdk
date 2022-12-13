import {
  Account,
  Attributes,
  ChainID,
  SdkConfig,
  TransactionHash,
  RequestArguments,
  EIP1193Provider,
} from './types'
import {
  ATTRIBUTION_EVENT,
  CHAIN_CHANGED_EVENT,
  TRANSACTION_TRIGGERED,
  CONNECT_EVENT,
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  DISCONNECT_EVENT,
  FIRST_PAGE_VISIT,
  IDENTITY_KEY,
  PAGE_EVENT,
  REFERRER_EVENT,
  TRANSACTION_EVENT,
  SIGNING_EVENT,
  CLICK_EVENT,
} from './constants'
import { postRequest } from './helpers'

export class ArcxAnalyticsSdk {
  /* --------------------------- Private properties --------------------------- */
  private _provider?: EIP1193Provider
  private _originalRequest?: EIP1193Provider['request']
  private _registeredListeners: Record<string, (...args: unknown[]) => void> = {}

  /* ---------------------------- Public properties --------------------------- */
  currentChainId?: string | null
  currentConnectedAccount?: string

  get provider(): EIP1193Provider | undefined {
    return this._provider
  }

  private constructor(
    public readonly apiKey: string,
    public readonly identityId: string,
    private readonly sdkConfig: SdkConfig,
  ) {
    this.setProvider(sdkConfig.initialProvider || window.web3?.currentProvider || window?.ethereum)

    if (sdkConfig.trackPages || sdkConfig.trackReferrer || sdkConfig.trackUTM) {
      this._trackFirstPageVisit()
    }

    if (this.sdkConfig.trackPages) {
      this._trackPagesChange()
    }

    if (this.sdkConfig.trackClicks) {
      this._trackClicks()
    }

    this._handleAccountDisconnected = this._handleAccountDisconnected.bind(this)
    this.setProvider = this.setProvider.bind(this)
  }

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

  private _registerAccountsChangedListener() {
    const listener = (...args: unknown[]) => this._onAccountsChanged(args[0] as string[])

    this._provider?.on('accountsChanged', listener)
    this._registeredListeners['accountsChanged'] = listener

    this._provider?.on('disconnect', this._handleAccountDisconnected)
    this._registeredListeners['disconnect'] = this._handleAccountDisconnected
  }

  private _registerChainChangedListener() {
    const listener = (...args: unknown[]) => this._onChainChanged(args[0] as string)
    this.provider?.on('chainChanged', listener)
    this._registeredListeners['chainChanged'] = listener
  }

  private _trackFirstPageVisit() {
    const attributes: FirstVisitPageType = {}

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

      attributes.utm = {
        source: searchParams.get('utm_source'),
        medium: searchParams.get('utm_medium'),
        campaign: searchParams.get('utm_campaign'),
      }
    }

    return this.event(FIRST_PAGE_VISIT, attributes)
  }

  private _trackPagesChange() {
    const oldPushState = history.pushState
    history.pushState = function pushState(...args) {
      const ret = oldPushState.apply(this, args)
      window.dispatchEvent(new window.Event('locationchange'))
      return ret
    }

    const oldReplaceState = history.replaceState
    history.replaceState = function replaceState(...args) {
      const ret = oldReplaceState.apply(this, args)
      window.dispatchEvent(new window.Event('locationchange'))
      return ret
    }

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new window.Event('locationchange'))
    })

    window.addEventListener('locationchange', () => this._onLocationChange())
  }

  private _onLocationChange() {
    const currentUrl = sessionStorage.getItem(CURRENT_URL_KEY)

    if (currentUrl !== window.location.href) {
      sessionStorage.setItem(CURRENT_URL_KEY, window.location.href)
      this.page({ url: window.location.href })
    }
  }

  private async _onAccountsChanged(accounts: string[]) {
    if (accounts.length > 0) {
      this._handleAccountConnected(accounts[0])
    } else {
      this._handleAccountDisconnected()
    }
  }

  private async _handleAccountConnected(account: string) {
    if (account === this.currentConnectedAccount) {
      // We have already reported this account
      return
    } else {
      this.currentConnectedAccount = account
    }

    this.currentChainId = await this._getCurrentChainId()

    return this.connectWallet({ chain: this.currentChainId, account: account })
  }

  private _handleAccountDisconnected() {
    if (!this.currentChainId || !this.currentConnectedAccount) {
      /**
       * It is possible that this function has already been called once and the cached values
       * have been cleared. This can happen in the following scenario:
       * 1. Initialize ArcxAnalyticsProvider with the default config (sets MM as the initial provider)
       * 2. Connect WalletConnect
       * 3. Disconnect
       */
      return
    }

    const disconnectAttributes = {
      account: this.currentConnectedAccount,
      chain: this.currentChainId,
    }
    this.currentChainId = undefined
    this.currentConnectedAccount = undefined

    return this.event(DISCONNECT_EVENT, disconnectAttributes)
  }

  private _onChainChanged(chainIdHex: string) {
    this.currentChainId = parseInt(chainIdHex, 16).toString()

    return this.event(CHAIN_CHANGED_EVENT, { chain: this.currentChainId })
  }

  private async _reportCurrentWallet() {
    if (!this.provider) {
      console.warn('ArcxAnalyticsSdk::_reportCurrentWallet: the provider is not set')
      return
    }

    const accounts = await this.provider.request<string[]>({ method: 'eth_accounts' })

    if (accounts && accounts.length > 0 && accounts[0]) {
      this._handleAccountConnected(accounts[0])
    }
  }

  private async _getCurrentChainId(): Promise<string> {
    if (!this.provider) {
      throw new Error('ArcxAnalyticsSdk::_getCurrentChainId: provider not set')
    }

    const chainIdHex = await this.provider.request<string>({ method: 'eth_chainId' })
    // Because we're connected, the chainId cannot be null
    if (!chainIdHex) {
      throw new Error(`ArcxAnalyticsSdk::_getCurrentChainId: chainIdHex is: ${chainIdHex}`)
    }

    return parseInt(chainIdHex, 16).toString()
  }

  /*
    Sent object in eth_sendTransaction is describe under link below:
    https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction
  */
  private _trackTransactions(): boolean {
    const provider = this.provider
    if (!provider) {
      return false
    }

    if (!this._originalRequest) {
      this._originalRequest = provider.request
    }

    // Deliberately not using this._original request to not intefere with the signature tracking's
    // request modification
    const request = provider.request.bind(provider)
    provider.request = async ({ method, params }: RequestArguments) => {
      if (Array.isArray(params) && method === 'eth_sendTransaction') {
        const transactionParams = params[0]
        const nonce = await provider.request({
          method: 'eth_getTransactionCount',
          params: [transactionParams.from, 'latest'],
        })

        this.event(TRANSACTION_TRIGGERED, {
          ...transactionParams,
          nonce,
        })
      }
      return request({ method, params })
    }

    return true
  }

  private _trackSigning() {
    if (!this.provider) {
      return false
    }

    if (!this._originalRequest) {
      this._originalRequest = this.provider.request
    }

    // Deliberately not using this._original request to not intefere with the transaction tracking's
    // request modification
    const request = this.provider.request.bind(this.provider)
    this.provider.request = async ({ method, params }: RequestArguments) => {
      if (Array.isArray(params)) {
        if (['signTypedData_v4', 'eth_sign'].includes(method)) {
          this.event(SIGNING_EVENT, {
            account: params[0],
            messageToSign: params[1],
          })
        }
        if (method === 'personal_sign') {
          this.event(SIGNING_EVENT, {
            messageToSign: params[0],
            account: params[1],
            password: params[2],
          })
        }
      }
      return request({ method, params })
    }
    return true
  }

  private _trackClicks() {
    window.addEventListener('click', (event: MouseEvent) => {
      if (event.target instanceof Element) {
        this.event(CLICK_EVENT, {
          elementId: getElementIdentifier(event.target),
          content: event.target.textContent,
        })
      } else {
        // TODO: fire warning report https://github.com/arcxmoney/analytics-sdk/issues/54
      }
    })
  }

  private _initializeWeb3Tracking() {
    if (this.provider) {
      if (this.sdkConfig.trackWalletConnections) {
        this._reportCurrentWallet()
        this._registerAccountsChangedListener()
      }

      if (this.sdkConfig.trackChainChanges) {
        this._registerChainChangedListener()
      }

      if (this.sdkConfig.trackSigning) {
        this._trackSigning()
      }

      if (this.sdkConfig.trackTransactions) {
        this._trackTransactions()
      }
    }
  }

  /********************/
  /** PUBLIC METHODS **/
  /********************/

  /**
   * Sets a new provider. If automatic EVM events tracking is enabled,
   * the registered listeners will be removed from the old provider and added to the new one.
   */
  setProvider(provider: EIP1193Provider | undefined) {
    if (provider === this._provider) {
      return
    }

    this.currentChainId = undefined
    this.currentConnectedAccount = undefined

    if (this._provider) {
      const eventNames = Object.keys(this._registeredListeners)
      for (const eventName of eventNames) {
        this._provider.removeListener(eventName, this._registeredListeners[eventName])
        delete this._registeredListeners[eventName]
      }

      // Restore original request
      if (this._originalRequest) {
        this._provider.request = this._originalRequest
        this._originalRequest = undefined
      }
    }

    this._provider = provider

    this._initializeWeb3Tracking()
  }

  /** Initialises the Analytics SDK with desired configuration. */
  static async init(apiKey: string, config?: Partial<SdkConfig>): Promise<ArcxAnalyticsSdk> {
    const sdkConfig = { ...DEFAULT_SDK_CONFIG, ...config }

    const identityId =
      (sdkConfig?.cacheIdentity && window.localStorage.getItem(IDENTITY_KEY)) ||
      (await postRequest(sdkConfig.url, apiKey, '/identify'))
    sdkConfig?.cacheIdentity && window.localStorage.setItem(IDENTITY_KEY, identityId)

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
  async referrer(referrer?: string) {
    return this.event(REFERRER_EVENT, { referrer: referrer || document.referrer })
  }
}

type FirstVisitPageType = {
  url?: string
  referrer?: string
  utm?: {
    source: string | null
    medium: string | null
    campaign: string | null
  }
}

function getElementIdentifier(clickedElement: Element): string {
  let identifier = clickedElement.tagName.toLowerCase()
  if (clickedElement.id) {
    identifier = `${identifier}#${clickedElement.id}`
  }

  if (clickedElement.classList.length > 0) {
    identifier = `${identifier}.${clickedElement.className.replace(/ /g, '.')}`
  }
  return identifier
}
