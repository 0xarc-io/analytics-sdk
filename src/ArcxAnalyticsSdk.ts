import { Attributes, ChainID, SdkConfig, RequestArguments, EIP1193Provider } from './types'
import {
  CURRENT_URL_KEY,
  DEFAULT_SDK_CONFIG,
  IDENTITY_KEY,
  SDK_VERSION,
  Event,
  SESSION_STORAGE_ID_KEY,
} from './constants'
import {
  createClientSocket,
  getElementsFullInfo,
  postRequest,
  generateUniqueID,
  getLibraryType,
} from './utils'
import { Socket } from 'socket.io-client'

export class ArcxAnalyticsSdk {
  /* --------------------------- Private properties --------------------------- */
  private _provider?: EIP1193Provider
  private _originalRequest?: EIP1193Provider['request']
  private _registeredProviderListeners: Record<string, (...args: unknown[]) => void> = {}

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
    private socket: Socket,
  ) {
    const provider = window?.ethereum || window.web3?.currentProvider
    if (provider) {
      this._trackProvider(provider)
    }

    if (this.sdkConfig.trackPages) {
      this._trackPagesChange()
    }

    if (this.sdkConfig.trackClicks) {
      this._trackClicks()
    }

    this._registerSocketListeners(socket)

    socket.once('error', (error) => {
      if (['InternalServerError', 'BadRequestError'].includes(error.name)) {
        window.localStorage.removeItem(IDENTITY_KEY)
        ArcxAnalyticsSdk._getIdentitityId(this.sdkConfig, this.apiKey).then((identityId) => {
          this.socket = createClientSocket(this.sdkConfig.url, {
            apiKey: this.apiKey,
            identityId,
            sdkVersion: SDK_VERSION,
            screenHeight: screen.height,
            screenWidth: screen.width,
            viewportHeight: window.innerHeight,
            viewportWidth: window.innerWidth,
            url: window.location.href,
            sessionStorageId: ArcxAnalyticsSdk._getSessionId(identityId),
          })
          this._registerSocketListeners(this.socket)
        })
      }
    })
    this._trackFirstPageVisit()
  }

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

  private _registerSocketListeners(socket: Socket) {
    socket.on('error', (error) => {
      console.error('error event received from socket', error)
      this._report('error', `Error event received from socket`, error)
    })
  }

  private _registerAccountsChangedListener() {
    const listener = (...args: unknown[]) => this._onAccountsChanged(args[0] as string[])

    this._provider?.on('accountsChanged', listener)
    this._registeredProviderListeners['accountsChanged'] = listener

    const _handleAccountDisconnected = this._handleAccountDisconnected.bind(this)
    this._provider?.on('disconnect', _handleAccountDisconnected)
    this._registeredProviderListeners['disconnect'] = _handleAccountDisconnected
  }

  private _trackFirstPageVisit() {
    if (!this.sdkConfig.trackPages) {
      return
    }

    return this._event(
      Event.PAGE,
      {
        referrer: document.referrer,
      },
      true,
    )
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
      this.page()
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

    return this.wallet({ chainId: this.currentChainId, account: account })
  }

  private _registerChainChangedListener() {
    const listener = (...args: unknown[]) => this._onChainChanged(args[0] as string)
    this.provider?.on('chainChanged', listener)
    this._registeredProviderListeners['chainChanged'] = listener
  }

  private _handleAccountDisconnected() {
    if (!this.currentChainId && !this.currentConnectedAccount) {
      /**
       * It is possible that this function has already been called once and the cached values
       * have been cleared. This can happen in the following scenario:
       * 1. Initialize ArcxAnalyticsProvider with the default config (sets MM as the initial provider)
       * 2. Connect WalletConnect
       * 3. Disconnect
       *
       * Another scenario is if the `disconnect` event is fired before or after the
       * `accountsChanged` event or if `disconnection()` was called before this function.
       */
      return
    }

    const disconnectAttributes = {
      account: this.currentConnectedAccount,
      chain: this.currentChainId,
    }
    this.currentChainId = undefined
    this.currentConnectedAccount = undefined

    return this._event(Event.DISCONNECT, disconnectAttributes)
  }

  private _onChainChanged(chainIdHex: string) {
    this.currentChainId = parseInt(chainIdHex).toString()

    return this.chain({
      chainId: this.currentChainId,
    })
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
      this._reportErrorAndThrow('ArcxAnalyticsSdk::_getCurrentChainId: provider not set')
    }

    const chainIdHex = await this.provider.request<string>({ method: 'eth_chainId' })
    // Because we're connected, the chainId cannot be null
    if (!chainIdHex) {
      this._reportErrorAndThrow(
        `ArcxAnalyticsSdk::_getCurrentChainId: chainIdHex is: ${chainIdHex}`,
      )
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
      this._report('error', 'ArcxAnalyticsSdk::_trackTransactions: provider not found')
      return false
    }

    if (Object.getOwnPropertyDescriptor(provider, 'request')?.writable === false) {
      this._report(
        'warning',
        'ArcxAnalyticsSdk::_trackTransactions: provider.request is not writable',
      )
      return false
    }

    // Deliberately not using this._original request to not intefere with the signature tracking's
    // request modification
    const request = provider.request.bind(provider)
    provider.request = async ({ method, params }: RequestArguments) => {
      if (Array.isArray(params) && method === 'eth_sendTransaction') {
        const transactionParams = params[0] as Record<string, unknown>
        let nonce = await provider.request<string>({
          method: 'eth_getTransactionCount',
          params: [transactionParams.from, 'latest'],
        })
        if (nonce) {
          nonce = parseInt(nonce).toString()
        }

        if (!this.currentChainId) {
          this._report('error', 'ArcxAnalyticsSdk::_trackTransactions: currentChainId is not set')
        }

        this._event(Event.TRANSACTION_TRIGGERED, {
          ...transactionParams,
          chainId: this.currentChainId,
          nonce,
        })
      }
      return request({ method, params })
    }

    return true
  }

  private _trackSigning() {
    if (!this.provider) {
      this._report('error', 'ArcxAnalyticsSdk::_trackTransactions: provider not found')
      return false
    }

    if (Object.getOwnPropertyDescriptor(this.provider, 'request')?.writable === false) {
      this._report(
        'warning',
        'ArcxAnalyticsSdk::_trackTransactions: provider.request is not writable',
      )
      return false
    }

    // Deliberately not using this._original request to not intefere with the transaction tracking's
    // request modification
    const request = this.provider.request.bind(this.provider)
    this.provider.request = async ({ method, params }: RequestArguments) => {
      if (Array.isArray(params)) {
        if (['signTypedData_v4', 'eth_sign'].includes(method)) {
          this._event(Event.SIGNING_TRIGGERED, {
            account: params[0],
            message: params[1],
          })
        }
        if (method === 'personal_sign') {
          this._event(Event.SIGNING_TRIGGERED, {
            message: params[0],
            account: params[1],
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
        this._event(Event.CLICK, {
          elementId: getElementsFullInfo(event.target),
          ...(event.target.textContent && { content: event.target.textContent }),
        })
      } else {
        this._report('warning', 'ArcxAnalyticsSdk::_trackClicks: event target is not Element')
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

  /** Report error to the server in order to better understand edge cases which can appear */
  _report(logLevel: 'error' | 'log' | 'warning', content: string, error?: object): Promise<string> {
    return postRequest(this.sdkConfig.url, this.apiKey, '/log-sdk', {
      logLevel,
      data: {
        msg: content,
        identityId: this.identityId,
        apiKey: this.apiKey,
        ...(error && { error: error }),
        url: window.location.href,
      },
    })
  }

  /** Report error to the server and throw an error */
  _reportErrorAndThrow(error: string): never {
    this._report('error', error)
    throw new Error(error)
  }

  /**
   * Flexible event reporting method to be used internally.
   */
  private _event(event: Event, attributes?: Attributes, ignoreLibraryUsage?: boolean) {
    // If the socket is not connected, the event will be buffered until reconnection and sent then
    this.socket.emit('submit-event', {
      event,
      attributes,
      url: window.location.href,
      ...(!ignoreLibraryUsage && { libraryType: getLibraryType() }),
    })
  }

  /**
   * Attaches web3 tracking to the given provider. If automatic EVM events tracking is enabled,
   * the registered listeners will be removed from the old provider and added to the new one.
   */
  private _trackProvider(provider: EIP1193Provider) {
    if (provider === this._provider) {
      return
    }

    this.currentChainId = undefined
    this.currentConnectedAccount = undefined

    if (this._provider) {
      const eventNames = Object.keys(this._registeredProviderListeners)
      for (const eventName of eventNames) {
        this._provider.removeListener(eventName, this._registeredProviderListeners[eventName])
        delete this._registeredProviderListeners[eventName]
      }

      // Restore original request
      if (
        this._originalRequest &&
        Object.getOwnPropertyDescriptor(this._provider, 'request')?.writable !== false
      ) {
        this._provider.request = this._originalRequest
      }
    }

    this._provider = provider
    this._originalRequest = provider?.request

    this._initializeWeb3Tracking()
  }

  private static async _getIdentitityId(sdkConfig: SdkConfig, apiKey: string) {
    const identityId =
      (sdkConfig?.cacheIdentity && window.localStorage.getItem(IDENTITY_KEY)) ||
      (await postRequest(sdkConfig.url, apiKey, '/identify'))
    sdkConfig?.cacheIdentity && window.localStorage.setItem(IDENTITY_KEY, identityId)
    return identityId
  }

  private static _getSessionId(identityId: string) {
    const existingSessionId = window.sessionStorage.getItem(SESSION_STORAGE_ID_KEY)
    if (existingSessionId) {
      return existingSessionId
    }

    const newSessionId = generateUniqueID(identityId)
    window.sessionStorage.setItem(SESSION_STORAGE_ID_KEY, newSessionId)
    return newSessionId
  }

  /********************/
  /** PUBLIC METHODS **/
  /********************/

  /** Initialises the Analytics SDK with desired configuration. */
  static async init(apiKey: string, config?: Partial<SdkConfig>): Promise<ArcxAnalyticsSdk> {
    const sdkConfig = { ...DEFAULT_SDK_CONFIG, ...config }

    const identityId = await ArcxAnalyticsSdk._getIdentitityId(sdkConfig, apiKey)
    const sessionId = ArcxAnalyticsSdk._getSessionId(identityId)

    const websocket = createClientSocket(sdkConfig.url, {
      apiKey,
      identityId,
      sdkVersion: SDK_VERSION,
      screenHeight: screen.height,
      screenWidth: screen.width,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      url: window.location.href,
      sessionStorageId: sessionId,
    })

    return new ArcxAnalyticsSdk(apiKey, identityId, sdkConfig, websocket)
  }

  /**
   * Logs the current page
   */
  page(): void {
    return this._event(Event.PAGE, {
      referrer: document.referrer,
    })
  }

  /**
   * Logs a wallet connection event.
   * @param chainId The chain ID the wallet connected to.
   * @param account The connected account.
   */
  wallet({ chainId, account }: { chainId: ChainID; account: string }): void {
    if (!chainId) {
      throw new Error('ArcxAnalyticsSdk::wallet: chainId cannot be empty')
    }
    if (!account) {
      throw new Error('ArcxAnalyticsSdk::wallet: account cannot be empty')
    }

    this.currentChainId = chainId.toString()
    this.currentConnectedAccount = account

    return this._event(Event.CONNECT, {
      chainId,
      account,
    })
  }

  /**
   * Logs a wallet disconnection event. Will clear the cached known chain ID and account.
   * @param account (optional) The disconnected account. Will use the previously recorded account if
   * not passed.
   * @param chainId (optional) The chain ID the wallet disconnected from.
   * Will use the previously recorded chain ID if not passed.
   */
  disconnection(attributes?: { account?: string; chainId?: ChainID }) {
    const account = attributes?.account || this.currentConnectedAccount
    if (!account) {
      // We have most likely already reported this disconnection with the automatic
      // `disconnect` detection
      return
    }

    const chainId = attributes?.chainId || this.currentChainId
    const eventAttributes = {
      account,
      ...(chainId && { chainId }),
    }

    this.currentChainId = undefined
    this.currentConnectedAccount = undefined

    return this._event(Event.DISCONNECT, eventAttributes)
  }

  /**
   * Logs a chain change.
   *
   * If `account` is not passed, the previously recorded account will be used
   * (from a previous `connectWallet()` or automatically detected if using Metamask).
   *
   * @param chainId The new chain ID the wallet connected to.
   * Either in hexadeciaml or decimal format.
   * @param account (optional) The connected account.
   * If not passed, the previously recorded account by the SDK will be used.
   */
  chain({ chainId, account }: { chainId: ChainID; account?: string }) {
    if (!chainId || Number(chainId) === 0) {
      throw new Error('ArcxAnalyticsSdk::chainChanged: chainId cannot be empty or 0')
    }

    if (isNaN(Number(chainId))) {
      throw new Error(
        'ArcxAnalyticsSdk::chainChanged: chainId must be a valid hex or decimal number',
      )
    }

    this.currentChainId = chainId.toString()

    return this._event(Event.CHAIN_CHANGED, {
      chainId,
      account: account || this.currentConnectedAccount,
    })
  }

  /**
   * Logs a transaction event.
   * @param transactionHash The transaction hash.
   * @param account (optional) The account that sent the transaction.
   * If not passed, the previously recorded account by the SDK will be used.
   * @param chainId (optional) The chain ID the transaction was sent to.
   * If not provided, the previously recorded chainID will be used.
   * @param metadata (optional) Any additional metadata to be logged.
   */
  transaction({
    transactionHash,
    account,
    chainId,
    metadata,
  }: {
    transactionHash: string
    account?: string
    chainId?: ChainID
    metadata?: Record<string, unknown>
  }) {
    if (!transactionHash) {
      throw new Error('ArcxAnalyticsSdk::transaction: transactionHash cannot be empty')
    }
    if (!chainId && !this.currentChainId) {
      throw new Error(
        'ArcxAnalyticsSdk::transaction: chainId cannot be empty and was not previously recorded',
      )
    }
    if (!account && !this.currentConnectedAccount) {
      throw new Error(
        'ArcxAnalyticsSdk::transaction: account cannot be empty and was not previously recorded',
      )
    }

    return this._event(Event.TRANSACTION_SUBMITTED, {
      chainId: chainId || this.currentChainId,
      account: account || this.currentConnectedAccount,
      transactionHash,
      ...(metadata && { metadata }),
    })
  }

  /**
   * Logs a signing event.
   * @param message Missage that was signed
   * @param signatureHash (optional) The signature hash
   * @param account (optional) The account that signed the message. If not passed, the previously
   * recorded account by the SDK will be used.
   */
  signature({
    message,
    signatureHash,
    account,
  }: {
    message: string
    signatureHash?: string
    account?: string
  }) {
    if (!message) {
      throw new Error('ArcxAnalyticsSdk::signedMessage: message cannot be empty')
    }

    if (!account && !this.currentConnectedAccount) {
      throw new Error(
        'ArcxAnalyticsSdk::signedMessage: account cannot be empty and was not previously recorded',
      )
    }

    return this._event(Event.SIGNING_TRIGGERED, {
      message,
      ...(signatureHash && { signatureHash: signatureHash }),
      account: account || this.currentConnectedAccount,
    })
  }

  /**
   * Logs a custom event
   * @param name Event name
   * @param attributes (Optional) Event attributes
   */
  event(name: string, attributes?: Attributes) {
    return this._event(Event.CUSTOM, {
      name,
      attributes,
    })
  }
}
