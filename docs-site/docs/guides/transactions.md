---
sidebar_position: 2
---

# Tracking Transactions

This guide explains to how to track transactions, and when it can be insufficient to use automatic tracking vs using manual tracking.

### The importance of tracking transactions

Tracking transactions via the SDK is required for the 0xArc App to fully benefit from the SDK. Without transaction events, we have no transaction hashes to match against the blockchain data we index, and the 0xArc App will not be able to show transaction data.

### Automatic vs Manual tracking of transactions

<!-- For example, via the [ethers library](https://docs.ethers.org/v5/api/utils/transactions/) or whichever library you're using. -->

If you are automatically tracking transactions with the non-react `.init()` method, the SDK automatically tracks the `TRANSACTION_TRIGGERED` event and `TRANSACTION_SUBMITTED` events for you, but **only for MetaMask**.

If you are using the React Provider, **you are required need to manually track transactions**.

Event with the non-react `.init()` method, manual tracking allows for more fine-grained control over the tracking process.

---

## How to manually track the transaction process

### Required events

When manually tracking the transaction process, **you are required to at a minimum track the following events with the SDK**, so 0xArc has the necessary information to match your SDK events to the blockchain:

1. [Wallet Connection](/tracking/wallet)
2. [Transaction](/tracking/transaction) - Required for us to have the `transactionHash` to match the transaction against the blockchain

**Note that if you do not track these 2 events, the SDK will not be able to match the transaction to the blockchain, and the transaction will not be shown in the 0xArc App.**

Although not strictly required, we strongly encourage you to also track the following events:

3. [Chain Changed](/tracking/chain) - Required for us to know which chain the transaction took place on
4. [Signing Events](/tracking/signature) - for a complete picture

### React Example of Required Events

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

---

## Adding additional custom events

Let's say you wanted to figure out: how many users are opening their wallet vs completing a transaction.

By only emitting the transaction event, we don't know the answer to this.

By using custom events, we can track every step of the transaction process, and figure out the answer to this question - or any other question related to drop off rates.

We solve this in the example below by emitting a custom event called `WALLET_OPENED` to indicate that the user opened their wallet. Again, we can name the custom event whatever we want, and add any metadata we want. The values above are for demonstration purposes.

Now we have a complete picture of the transaction process from the point of **opening a wallet** to **submitting a transaction**. This allows us to [create a Funnel in 0xArc App](/guides/custom-events#custom-events-and-funnels) to answer our question above.

We can add additional events between the trigger and submission to capture more information as desired. See the [Custom Events Guide](/guides/custom-events) for more info.

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'
import { useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

const Component = () => {
  const sdk = useArcxAnalytics()
  const { account, chainId, activate, deactivate } = useWeb3React()
  const metamaskConnector = new MetaMask()

  // 1. We will automatically track the page event to capture the page the user is on

  // Store the previous chainId value in state
  const [previousChainId, setPreviousChainId] = useState(chainId)

  useEffect(() => {
    setPreviousChainId(chainId)
  }, [chainId])

  const handleWalletOpen = async () => {
    // 2. This is where you emit the wallet opened event, which is a custom SDK event
    // We attach these extra attributes as metadata to the custom event,
    // which we can use to filter events in the 0xArc App
    await sdk.event('WALLET_OPENED', {
      apiVersion: 'v1',
      walletType: 'METAMASK
    })

    // This function call opens the MetaMask wallet,
    // triggering the useEffect below once the user connects
    await activate(metamaskConnector)
  }

  const handleDisconnect = async () => {
    // 6. This is where you emit the wallet disconnection event
    await sdk.disconnection({ account, chainId })
    // This function call closes the metamask wallet
    await deactivate()
  }

  // 3. This is where you emit the wallet connection once the user has connected their web3 wallet
  useEffect(() => {
    if (account && chainId) {
      sdk.wallet({ account, chainId })
    }
  }, [account, chainId, sdk])

  // 4. Track when the chain changes
  useEffect(() => {
    if (chainId && chainId !== previousChainId) {
      // If the chain ID is changed, we emit the chain changed event
      sdk.chain({ chainId, account })
    }
  }, [chainId, sdk])


// 5. The user has triggered a transaction. We send this to the SDK with the transaction hash
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
      <button onClick={handleDisconnect}>Disconnect Wallet</button>
    </>
  )
}
```

As you can see in the example above, we also show how triggering the `chain change` event, and `disconnection` event look in practice.

---

## Confirming a Submitted Transaction

Assuming you've sent the required `.transaction()` event as earlier outlined, 0xArc will automatically match the transaction hash of the transaction event to the submitted transaction on the blockchain, and confirm if a transaction was completed or not.

This is possible since 0xArc pre-indexes all transaction data from the blockchain and matches the transaction hashes of the transaction events to the blockchain data.

Therefore, you do not need to manually track the transaction hash of a submitted transaction, as 0xArc will automatically do this for you.
