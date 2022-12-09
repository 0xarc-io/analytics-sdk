import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>((actions) => {
  const mainnetKey = process.env.REACT_APP_ALCHEMY_KEY_MAINNET
  const polygonKey = process.env.REACT_APP_ALCHEMY_KEY_POLYGON

  if (!mainnetKey) {
    throw new Error('Missing Alchemy API key REACT_APP_ALCHEMY_KEY_MAINNET')
  }

  if (!polygonKey) {
    throw new Error('Missing Alchemy API key REACT_APP_ALCHEMY_KEY_POLYGON')
  }

  return new WalletConnect({
    actions,
    options: {
      rpc: {
        1: 'https://eth-mainnet.g.alchemy.com/v2/' + mainnetKey,
        137: 'https://polygon-mainnet.g.alchemy.com/v2/' + polygonKey,
      },
      qrcode: true,
    },
  })
})
