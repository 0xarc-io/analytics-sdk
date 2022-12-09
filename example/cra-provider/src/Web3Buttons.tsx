import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { useEffect, useState } from 'react'
import { useArcxAnalytics } from '@arcxmoney/analytics'
import { metamask, walletConnect } from './connectors'

export const Web3Buttons = () => {
  const sdk = useArcxAnalytics()
  const { account, connector, chainId, provider } = useWeb3React()
  const [connectedWallet, setConnectedWallet] = useState<'metamask' | 'walletConnect' | undefined>()

  useEffect(() => {
    if (sdk && provider) {
      sdk.setProvider(provider.provider as any)
    }
  }, [provider])

  const onConnectWalletClicked = async (givenConnector: Connector, chainId?: number) => {
    try {
      console.log({ givenConnector: givenConnector, provider: givenConnector.provider })
      await givenConnector.activate(chainId)
      if (givenConnector === metamask) {
        setConnectedWallet('metamask')
      } else if (givenConnector === walletConnect) {
        setConnectedWallet('walletConnect')
      }
    } catch (err) {
      console.error('MetamaskButtons::onConnectMetamaskClicked: error connecting wallet', err)
    }
  }

  const onDisconnectClicked = () => {
    if (connector?.deactivate) {
      connector.deactivate()
    } else {
      metamask.resetState()
    }
    setConnectedWallet(undefined)
  }

  return (
    <>
      <div className="text-lg font-bold">Web3</div>
      <div className="flex gap-4">
        {connectedWallet !== 'metamask' && (
          <button
            className="rounded-full bg-white px-4 py-2 hover:bg-gray-100 font-bold text-black"
            onClick={() => onConnectWalletClicked(metamask, 1)}
          >
            Connect Metamask
          </button>
        )}
        {connectedWallet !== 'walletConnect' && (
          <button
            className="rounded-full bg-white px-4 py-2 hover:bg-gray-100 font-bold text-black"
            onClick={() => onConnectWalletClicked(walletConnect, 1)}
          >
            Connect WalletConnect
          </button>
        )}
        {account && (
          <button
            className="rounded-full bg-white px-4 py-2 hover:bg-gray-100 font-bold text-black"
            onClick={onDisconnectClicked}
          >
            Disconnect
          </button>
        )}
        {account && (
          <button
            className="rounded-full bg-purple-500 px-4 py-2 hover:bg-purple-300 font-bold"
            onClick={() => onConnectWalletClicked(connector, chainId === 1 ? 137 : 1)}
          >
            Change to {chainId === 1 ? 'Polygon' : 'Ethereum'}
          </button>
        )}
      </div>
    </>
  )
}
