import { Account, Attributes, ChainID, SdkConfig, TransactionHash } from './types'
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
} from './constants'
import { postRequest } from './helpers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { RequestArguments } from '@metamask/providers/dist/BaseProvider'

export class ArcxAnalyticsSdk {
  currentChainId?: string | null
  currentConnectedAccount?: string

  private constructor(
    public readonly apiKey: string,
    public readonly identityId: string,
    private readonly sdkConfig: SdkConfig,
  ) {
    if (sdkConfig.trackPages || sdkConfig.trackReferrer || sdkConfig.trackUTM) {
      this._trackFirstPageVisit()
    }

    if (this.sdkConfig.trackPages) {
      this._trackPagesChange()
    }

    if (sdkConfig.trackWalletConnections) {
      this._reportCurrentWallet()
      window.ethereum?.on('accountsChanged', (...args: unknown[]) =>
        this._onAccountsChanged(args[0] as string[]),
      )
    }

    if (sdkConfig.trackChainChanges) {
      window.ethereum?.on('chainChanged', (...args: unknown[]) =>
        this._onChainChanged(args[0] as string),
      )
    }

    if (this.sdkConfig.trackTransactions) {
      this._trackTransactions()
    }

    if (this.sdkConfig.trackSigning) {
      this._trackSigning()
    }
  }

  /**********************/
  /** INTERNAL METHODS **/
  /**********************/

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
      throw new Error(
        'ArcxAnalyticsSdk::_handleAccountDisconnected: previousChainId or previousConnectedAccount is not set',
      )
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
    if (!window.ethereum) {
      console.warn('ArcxAnalyticsSdk::_reportCurrentWallet: No ethereum provider found')
      return
    }

    const accounts = await window.ethereum.request<string[]>({ method: 'eth_accounts' })

    if (accounts && accounts.length > 0 && accounts[0]) {
      this._handleAccountConnected(accounts[0])
    }
  }

  private async _getCurrentChainId(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('ArcxAnalyticsSdk::_getCurrentChainId: No ethereum provider found')
    }

    const chainIdHex = await window.ethereum.request<string>({ method: 'eth_chainId' })
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
    const provider = getWeb3Provider()
    if (!provider) {
      return false
    }

    const request = provider.request
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
    const provider = getWeb3Provider()
    if (!provider) {
      return false
    }
    const request = provider.request
    provider.request = async ({ method, params }: RequestArguments) => {
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

  /********************/
  /** PUBLIC METHODS **/
  /********************/

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

function getWeb3Provider(): MetaMaskInpageProvider | undefined {
  return window.web3?.currentProvider || window?.ethereum
}
