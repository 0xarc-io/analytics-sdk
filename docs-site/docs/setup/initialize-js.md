---
sidebar_position: 2
---

# NPM + JS

This method utilises JavaScript in non-React projects to initialize the SDK. Installation is available through NPM, and SDK initialization is via the `.init()` method.

Click Events and Page Events are automatically tracked. For the SDK to properly work, you must manually track Wallet Connection and Transaction Events. Follow this guide for instructions.

---

### 1. Import the SDK class

```tsx
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'
```

---

### 3. Initialize the SDK

To initialize the Analytics SDK one should invoke the `.init()` method on the class. This configures the SDK with your API key and, optionally, configuration options.

**Note**: you do not need to call this function if using the React provider. But the configuration options below are instead passed into the `config` prop of the `ArcxAnalyticsProvider` component. See [here](/guides/automatic#configuration-options).

Initialize the SDK and keep an instance of it ready to reference in other parts of your app. To do this, add the following code on your app’s load:

```tsx
const sdk = await ArcxAnalyticsSdk.init(
  'YOUR_API_KEY', // The 0xArc-provided API key
  {
    // list any features you'd like to disable here
    cacheIdentity: true,
    trackReferrer: true,
    trackPages: true,
    trackUTM: true,
    trackTransactions: true,
  },
)
```

### `.init()` Parameters

- `apiKey` **(string)** (required) - the 0xArc-provided API key. See [here](/retrieve-api-key) for instructions on how to retrieve your API key.
- `config` **(object)** - overrides of the default [SDK configuration](/guides/automatic#configuration-options).

Note that the api key is required. The key is a string that uniquely identifies your project.

---

### 4. Start tracking

To disable the automatic tracking of Click & Page Events, see [here](/guides/automatic).

As mentioned earlier, you **must** manually track Wallet Connection and Transaction Events for the SDK to work properly.

The below is an example which shows how you would track the minimum required events to track a transaction, with the `@web3-react/core` library.

```tsx
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY')

// Get references to DOM elements
const openWalletButton = document.querySelector('#open-wallet-btn')
const sendTxButton = document.querySelector('#send-tx-btn')

const context = Web3ReactProvider.getContext()

// 1. Implement your own logic here to actually open the web3 wallet

// 2. This is where you emit the wallet connection once the user has connected their web3 wallet
connector.on('Web3ReactUpdate', ({ account, chainId }) => {
  if (account && chainId) {
    sdk.wallet({ account, chainId })
  }
})

// 3. The user has triggered a transaction. We send this to the SDK with the transaction hash
const sendTransaction = async () => {
  // Example: Simulating a transaction call
  // In a real scenario, you would replace this with your transaction logic,
  // for example, using ethers.js or web3.js to interact with a smart contract

  const transactionHash = '0x023c0e7...' // Placeholder for the actual transaction hash
  const { account, chainId } = context.getState()

  // Assuming the transaction was successful and you have the hash
  // Now, track the transaction using the analytics SDK
  sdk.transaction({
    transactionHash,
    account,
    chainId,
  })
}

// Attach click handlers
openWalletButton.addEventListener('click', connectWallet)
sendTxButton.addEventListener('click', sendTransaction)
```

### Tracking Other SDK Events

If you would like to track other events like [Signing Events](/tracking/signature), [Chain Change Events](/tracking/chain), or [Wallet Disconnection Events](/tracking/disconnection), you can do so by following the instructions in the respective guides linked.

### Tracking Custom Events

If you would like to track custom events, you can do so by following the instructions in the [Custom Events](/guides/custom-events) guide.
