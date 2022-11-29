import { useWeb3React } from '@web3-react/core'
import { metamask } from './connectors'

export const MetamaskButtons = () => {
  const { account, connector } = useWeb3React()

  const onConnectMetamaskClicked = async () => {
    try {
      await metamask.activate()
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
  }

  return (
    <>
      <div className="text-lg font-bold">Metamask</div>
      <div className="flex gap-4 mt-2">
        {!account && (
          <button
            className="rounded-full bg-white px-4 py-2 hover:bg-gray-100 font-bold text-black"
            onClick={onConnectMetamaskClicked}
          >
            Connect
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
        <button className="rounded-full bg-purple-500 px-4 py-2 hover:bg-purple-300 font-bold">
          Change to Polygon
        </button>
      </div>
    </>
  )
}
