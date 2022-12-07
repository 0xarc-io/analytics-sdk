import { MetaMask } from '@web3-react/metamask'
import { initializeConnector } from '@web3-react/core'

export const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions }),
)
