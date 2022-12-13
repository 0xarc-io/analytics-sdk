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
    } else if (sdk && sdk.provider && !provider) {
      // provider disconnected from external source (e.g. user clicked disconnect in wallet connect)
      setConnectedWallet(undefined)
    }
  }, [sdk, provider])

  const onConnectWalletClicked = async (givenConnector: Connector, chainId?: number) => {
    try {
      if (givenConnector === metamask) {
        await givenConnector.activate(chainId)
        setConnectedWallet('metamask')
      } else if (givenConnector === walletConnect) {
        await givenConnector.activate()
        setConnectedWallet('walletConnect')
      }
    } catch (err) {
      console.error('Web3Buttons::onConnectWalletClicked: error connecting wallet', err)
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
        {account && (
          <button
            className="rounded-full bg-black px-4 py-2 hover:bg-gray-800 font-bold text-white"
            onClick={onDisconnectClicked}
          >
            Disconnect
          </button>
        )}
        {connectedWallet !== 'metamask' && (
          <button
            className="rounded-full bg-orange-500 px-4 py-2 hover:bg-orange-400 font-bold text-black"
            onClick={() => onConnectWalletClicked(metamask, 1)}
          >
            Connect Metamask
          </button>
        )}
        {connectedWallet !== 'walletConnect' && (
          <button
            className="rounded-full bg-blue-500 px-4 py-2 hover:bg-blue-400 font-bold text-white"
            onClick={() => onConnectWalletClicked(walletConnect, 1)}
          >
            Connect WalletConnect
          </button>
        )}
        {account && (
          <button
            className="rounded-full bg-white px-4 py-2 hover:bg-purple-300 font-bold text-black"
            onClick={() => onConnectWalletClicked(connector, chainId === 1 ? 5 : 1)}
          >
            Change to {chainId === 1 ? 'Goerli' : 'Ethereum'}
          </button>
        )}
      </div>
    </>
  )
}
