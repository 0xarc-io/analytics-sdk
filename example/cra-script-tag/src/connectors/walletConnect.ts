import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>((actions) => {
  const mainnetKey = process.env.REACT_APP_ALCHEMY_KEY_MAINNET
  const goerliKey = process.env.REACT_APP_ALCHEMY_KEY_GOERLI

  if (!mainnetKey) {
    throw new Error('Missing Alchemy API key REACT_APP_ALCHEMY_KEY_MAINNET')
  }

  if (!goerliKey) {
    throw new Error('Missing Alchemy API key REACT_APP_ALCHEMY_KEY_GOERLI')
  }

  return new WalletConnect({
    actions,
    options: {
      rpc: {
        1: 'https://eth-mainnet.g.alchemy.com/v2/' + mainnetKey,
        5: 'https://eth-goerli.g.alchemy.com/v2/' + goerliKey,
      },
      qrcode: true,
    },
  })
})
