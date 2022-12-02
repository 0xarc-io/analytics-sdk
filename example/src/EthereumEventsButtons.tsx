import { useWeb3React } from '@web3-react/core'

export const EthereumEventsButtons = () => {
  const { isActive, provider, chainId } = useWeb3React()

  const sendTransaction = async () => {
    if ([137, 1].includes(chainId!)) {
      alert('Transaction is not executed. Change to testnet in order not to lose your money')
      return
    }
    const signer = provider?.getSigner()
    await signer?.sendTransaction({
      to: '0x0000000000000000000000000000000000000000',
      value: '10000000000'
    })
  }

  const signMessage = async () => {
    const exampleMessage = 'Example `personal_sign` message'
    const signer = provider?.getSigner()
    return signer?.signMessage(exampleMessage)
  }

  if (!isActive) {
    return null
  }

  return (
    <>
      <div className="text-lg font-bold">Ethereum (don't use prodnets)</div>
      <div className="flex gap-4 mt-2">
        <button
          className="rounded-full bg-white px-4 py-2 hover:bg-gray-100 font-bold text-black"
          onClick={() => sendTransaction()}
        >
          Send transaction
        </button>
        <button
          className="rounded-full bg-purple-500 px-4 py-2 hover:bg-purple-300 font-bold"
          onClick={() => signMessage()}
        >
          Sign message
        </button>
      </div>
    </>
  )
}
