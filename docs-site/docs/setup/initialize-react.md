---
sidebar_position: 1
---

# NPM + React (Recommended)

React is the recommended way to use the SDK.

This method utilises a React Provider to initialize the SDK.

When using the React Provider, Click Events and [Page Events](/tracking/page) are automatically tracked. For the SDK to properly work, you **must** manually track [Wallet Connection](/tracking/wallet) and [Transaction](/tracking/transaction) Events. Follow this guide for instructions.

---

## 1. Import the React Provider

Import the SDK React Provider at the top of your component tree

```tsx
import { ArcxAnalyticsProvider } from '@0xarc-io/analytics'
```

---

## 2. Wrap your tree with the provider

```tsx
import React from 'react'
import ReactDOM from 'react-dom'
import { ArcxAnalyticsProvider } from '@0xarc-io/analytics'
import App from './App' // Import your main App component

const apiKey = 'YOUR_API_KEY' // Replace with your actual 0xArc analytics API key

const RootComponent = () => (
  <ArcxAnalyticsProvider apiKey={apiKey}>
    <App />
  </ArcxAnalyticsProvider>
)

ReactDOM.render(<RootComponent />, document.getElementById('root'))
```

If you haven't already, you can retrieve your API key by following the instructions in the [Retrieve your API Key](/retrieve-api-key) docs.

Once you have your API key, pass it to the provider as a prop, as demonstrated in the example above.

Note that the `apiKey` prop is required. The key is a string that uniquely identifies your project. Since it is a public key, you can safely expose it to the client.

---

## 3. Start tracking

To disable the automatic tracking of Click & Page Events, see [here](/guides/automatic).

As mentioned earlier, you **must** manually track Wallet Connection and Transaction Events for the SDK to work properly.

The below is an example which shows how you would track the minimum required events to track a transaction, with the `@web3-react/core` library.

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'
import { useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

const Component = () => {
  const sdk = useArcxAnalytics()
  const { account, chainId } = useWeb3React()
  const metamaskConnector = new MetaMask()

  // 1. This function call opens the MetaMask wallet,
  // triggering the useEffect below once the user connects
  const handleWalletOpen = async () => {
    await activate(metamaskConnector)
  }

  // 2. This is where you emit the wallet connection once the user has connected their web3 wallet
  useEffect(() => {
    if (account && chainId) {
      sdk.wallet({ account, chainId })
    }
  }, [account, chainId, sdk])

  // 3. The user has triggered a transaction. We send this to the SDK with the transaction hash
  const sendTransaction = async () => {
    // Example: Simulating a transaction call
    // In a real scenario, you would replace this with your transaction logic,
    // for example, using ethers.js or web3.js to interact with a smart contract

    const transactionHash = '0x023c0e7...' // Placeholder for the actual transaction hash

    // Assuming the transaction was successful and you have the hash
    // Now, track the transaction using the analytics SDK
    sdk.transaction({
      transactionHash,
      account,
      chainId,
    })
  }

  return (
    <>
      <button onClick={handleWalletOpen}>Open Wallet</button>
      <button onClick={sendTransaction}>Trigger Transaction</button>
    </>
  )
}
```

### Tracking Other SDK Events

If you would like to track other events like [Signing Events](/tracking/signature), [Chain Change Events](/tracking/chain), or [Wallet Disconnection Events](/tracking/disconnection), you can do so by following the instructions in the respective guides linked.

### Tracking Custom Events

If you would like to track custom events, you can do so by following the instructions in the [Custom Events](/guides/custom-events) guide.
