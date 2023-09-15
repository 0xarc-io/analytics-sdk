[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![npm version](https://badge.fury.io/js/@arcxmoney%2Fanalytics.svg)](https://badge.fury.io/js/@arcxmoney%2Fanalytics) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

> The ARCx Analytics SDK is a simple SDK that helps provide higher fidelity analytics by merging on-chain data with off-chain data from front-ends. We value user privacy and do not collect IP addresses or scrape any information without your permission.

# Installation Guide

## Option 1 - via script tag (preferred)

---

This is the simplest option to get started with ARCx Analytics, all you need to do is add this to the `HEAD` of your `index.html` file:

```html
<script>
  const script = document.createElement('script')
  const apiKey = YOUR_API_KEY
  const config = {} // Add any configuration parameters you'd like here
  script.src = '<https://unpkg.com/@arcxmoney/analytics>'
  script.onload = function () {
    ArcxAnalyticsSdk.init(apiKey, config).then(function (sdk) {
      window.arcx = sdk
    })
  }

  document.head.appendChild(script)
</script>
```

That’s it! The ARCx SDK will automatically detect wallet connections, referrer data, button clicks, page tracks and transactions that occur on your front-end.

You will now have access to the ARCx SDK instance via `window.arcx` anywhere in the app, in case you want to use any specific functionality described in the [API section below](#api).

## Option 2 (via React Component)

---

To get started, simply install the SDK into your Typescript/Javascript project by running `npm add @arcxmoney/analytics` or `yarn add @arcxmoney/analytics` (whatever you prefer) ⭐️

Then, put the `ArcxAnalyticsProvider` anywhere at top of your component tree.

```html
// App.jsx import { ArcxAnalyticsProvider } from '@arcxmoney/analytics' export default App = () => (
<ArcxAnalyticsProvider apiKey="{YOUR_APY_KEY}">
  {/* Your other components here, such as <ChildComponent /> */}
</ArcxAnalyticsProvider>
)
```

Now, you can use the `useArcxAnalytics()` hook in all of its child components to access the `sdk` object to log custom events or data.

```html
// ChildComponent.jsx
import { useArcxAnalytics } from '@arcxmoney/analytics'

export const ChildComponent = () => {
  const sdk = useArcxAnalytics()

  if (!sdk) return (
    <div>loading...</div>
  )

  return (
    <button onClick={() => sdk.event('BUTTON_CLICKED')}>Emit event</button>
  )
}
```

If you want to disable any of the default features, you can pass an optional `config` prop to the `ArcxAnalyticsProvider` component.

## Option 3 (via manual instantiation)

---

This is for those that would like to have very granular control over what is sent and how tracking is implemented.

To get started, simply install the SDK into your Typescript/Javascript project by running `npm add @arcxmoney/analytics` or `yarn add @arcxmoney/analytics` (whatever you prefer) ⭐️

Once you’ve done that, you’ll need to initialise the SDK and keep an instance of it ready to reference in other parts of your app. In order to do this, add the following code on your app’s load:

```jsx
import { ArcxAnalyticsSdk } from '@arcxmoney/analytics'

let arcx = await ArcxAnalyticsSdk.init(API_KEY, {
  // list any features you'd like to disable here
  trackPages: false,
  trackWalletConnections: false,
})
```

### Manual event tracking

#### 1. Wallet Connects

---

A critical part of the ARCx analytics product is associating off-chain behaviour with on-chain wallet activity. In order to do this, we need to be able to link your wallet to the currently active session and the chain that the user is connected to. The chain field should contain the numeric chain ID passed as a string.

```jsx
arcx.connectWallet({ account: '0x1234', chain: '1' })
```

#### 2. Chain changes

---

To effectively track and log the changes in the blockchain that the wallet is connected to, the ARCx analytics SDK offers a `chainChanged` function. Utilize this function to note the alterations in the chain ID, fostering more substantial and dynamic analytics. Here is a breakdown of how you can employ this function in your SDK:

```typescript
arcx.chainChanged({ chainId, account })
```

**Parameters:**

- `chainId`: (**Required**, number | string) - The new chain ID to which the wallet is connected. It can be in either hexadecimal or decimal format. The function records the current state of the chain ID, facilitating data capture on blockchain dynamics.
- `account`: (Optional, string) - The wallet account involved in the change. If not passed, the SDK will resort to the last recorded account from a previous `connectWallet()` invocation or automatically retrieve it if Metamask is in use.

#### 3. Transactions

---

The final piece for a bare-bone installation of ARCx analytics is registering transactions that occur on-chain. In addition to passing the transaction hash, we need the ID of the chain the transaction is occurring on and optionally, any attributes you’d like to pass to further segment the event.

```jsx
arcx.transaction({
  chain, // required(string) - chain ID that the transaction is taking place on
  transactionHash, // required(string) - hash of the transaction
  metadata, // optional(object) - additional information about the transaction
})
```

> 🔥 Hurray! You’ve completed the bare-bone installation of the ARCx analytics SDK. The following steps beyond this are optional but can given greater resolution and insights if implemented.

#### 4. Signatures

Signing events can occur when a user signs a message through their wallet. The ARCx analytics SDK allows tracking these events through the signedMessage function. Leveraging this function enables the capturing of intricate details surrounding signed messages, enhancing the granularity of analytics derived from user interactions. Here’s how to use the function:

```typescript
arcx.signedMessage({
  message,          // required(string) - The message that was signed
  signatureHash,    // optional(string) - The hash of the signature
  account,          // optional(string) - The account that signed the message. If not passed, the previously recorded account by the SDK will be utilized
})
```

**Parameters:**

- `message`: (**Required**, string) - The message that was signed. This parameter cannot be empty; attempting to pass an empty string will throw an error, ensuring that meaningful data is always captured.
- `signatureHash`: (Optional, string) - The hash associated with the signature. While not compulsory, including this detail can help us confirm whether the signature is valid.
- `account`: (Optional, string) - The account involved in signing the message. In instances where it is not provided, the SDK will refer to the most recently recorded account either from the last `connectWallet()` call or discovered automatically on Metamask given the `trackWalletConnections` option is turned on.

#### 5. Events & Attribution (optional)

---

Tracking key events inside your app allows the product to provide detailed information such as what percentage of whales convert through your product funnel relative to new users. The more event data we have, the more insights we can provide to help improve your product.

```jsx
arcx.event(
  eventName, // required(string) - the name of the event (eg. "clicked-tab")
  attributes, // optional(object) - additional information about the event
)
```

In addition to events, tracking attribution allows you to understand which marketing campaigns are successful through wallet tagging.

```jsx
arcx.attribute({
  source, // optional(string) - the origin of the web traffic (eg. discord, twitter etc)
  campaignId, // optional(string) - a specific identifier of the campaign (eg. bankless-5)
})
```

> ✅ That’s all there is to it. Leave all the magic on-chain wizardry to us from beyond here.

# SDK Configuration

Regardless of which installation method you choose, you can disable any automatic tracking feature you want by passing an optional `config` parameter either to the `init` function or to the React provider.

The configuration options are:

| Config key               | Type            | Description                                                  | Default           |
| ------------------------ | --------------- | ------------------------------------------------------------ | ----------------- |
| `cacheIdentity`          | boolean         | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`            |
| `initialProvider`        | EIP1193Provider | The provider to use for the web3 tracking events             | `window.ethereum` |
| `trackReferrer`          | boolean         | Whether or not to emit an initial `REFERRER` event containing the referrer attribute | `true`            |
| `trackPages`             | boolean         | Tracks whenever there is a URL change during the session and logs it automatically. | `true`            |
| `trackUTM`               | boolean         | Automatically reports the UTM tags (`utm_campaign, utm_medium, utm_source`) of the first page visit | `true`            |
| `trackWalletConnections` | boolean         | Automatically track wallet connections on the provider passed to `initialProvider` or `setProvider`. | `true`            |
| `trackTransactions`      | boolean         | Automatically track transaction requests on the provider passed to `initialProvider` or `setProvider`. | `true`            |
| `trackSigning`           | boolean         | Automatically track signing requests on the provider passed to `initialProvider` or `setProvider`. | `true`            |
| `trackClicks`            | boolean         | Automatically track click events                             | `true`            |

# API

### `init`

To initialize the Analytics SDK one should invoke the `init` method on the
class. This configures the SDK with your API key and, optionally, configuration
options.

**Note**: you do not need to call this function if using the React provider.

**Parameters:**

- `apiKey` **(string)** - the ARCx-provided API key.
- `config` **(object)** - overrides of the SDK configuration [above](#sdk-configuration).

```js
await analytics = await ArcxAnalyticsSdk.init(
  YOUR_API_KEY, // The ARCx-provided API key
  {
    cacheIdentity: true,
    trackReferrer: true,
    trackPages: true,
    trackUTM: true,
    trackTransactions: true,
  }
)
```

### `setProvider`

Sets the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) to use. If automatic EVM events tracking is enabled, the registered listeners will be removed from the old provider and added to the new one.

**Parameters:**

- `provider` **(EIP1193Provider)** - the provider to use

### `event`

A generic, catch-all `event` log. Use this method when no existing methods
satisfy your requirements.

**Parameters:**

- `event` **(string)** - the ID used to track this specific event.
- `attributes` **(object)** - an arbitrarily structured object of event information.

**Example:**

```js
await analytics.event('CHANGED_PFP', {
  oldPFP: 'dingo',
  newPFP: 'unicorn',
})
```

### `page`

Allows manual logging page visit events. Only use this method when `trackPages`
is set to `false`.

**Parameters:**

- `attributes` **(object)**
  - `url` **(string)** - the new URL that the user has navigated to.

**Example:**

```js
await analytics.page({ url: 'https://dapp.com/subpage/' })
```

### `connectWallet`

Logs when a user connects their wallet to the dApp.

**Parameters:**

- `attributes` **(object)**
  - `chain` **(number)** - the chain ID which this address applied to.
  - `account` **(string)** - the address of the connected wallet on the supplied chain.

**Example:**

```js
await analytics.connectWallet({
  account: '0x123',
  chain: 1,
})
```

### `chainChanged`

Logs when there is a change in the blockchain the user’s wallet is connected to. This function is instrumental in tracking user behavior associated with different chains, facilitating a richer analysis in your ARCx analytics setup.

**Parameters:**

- `attributes` **(object)**
  - `chainId` **(number | string)** - The updated chain ID to which the wallet is connected. It should be provided in either a hexadecimal or decimal format to facilitate the change log. This parameter is mandatory to invoke the function.
  - `account` **(string, optional)** - The account associated with the chain change event. If not specified, the function automatically resorts to using the previously recorded account from the last `connectWallet()` call or retrieves it from Metamask if it’s in use and the `trackWalletConnections` config is turned on.

**Example:**

```typescript
arcx.chainChanged({ chainId: '1', account: '0x1234' })
```

### `transaction`

Logs when a transaction is submitted by a user.

**Parameters:**

- `attributes` **(object)**
  - `chain` **(string | number)** - the chain ID where the transaction took place.
  - `transactionHash` **(string)** - the transaction hash of the transaction.
  - `metadata` **(object)** - an optional collection of transaction metadata that you wish to capture.

**Example:**

```js
await analytics.transaction({
  chain: 1,
  transactionHash: '0xABCabc123',
})
```

### `attribute`

Attaches metadata about a session indicating the origination of the traffic.
Used for more advanced analytics.

**Parameters:**

- `attributes` **(object)**
  - `source` **optional(string)** - the `source` that the traffic originated from (e.g. `discord`, `twitter`)
  - `medium` **optional(string)** - the `medium`, defining the medium your visitors arrived at your site
  * (e.g. `social`, `email`)
  - `campaign` **optional(string)** - the `campaign` if you wish to track a specific marketing campaign (e.g. `bankless-podcast-1`, `discord-15`)

**Example:**

```js
await analytics.attribute({
  source: 'discord',
  campaign: 'ama--2022-10-10',
})
```

# Important Note

We do not support automatic wallet activity tracking with wallets other than Metamask.

To fix this, you must pass the newly connected provider to the `sdk.setProvider(newProvider)` instance. Doing so will tell the SDK to watch that provider and fire any wallet connections/transactions/signature requests that wallet will be doing on your dApp! ✅

# Development notes

To run a local version of the script:

1. `yarn build`
2. Copy the `dist` folder to `example/cra-script-tag/public/analytics-sdk`:

```
cp -R dist example/cra-script-tag/public/analytics-sdk
```

3. Replace the unpkg link in `example/cra-scripttag/public/index.html` to `/analytics-sdk/index.umd.min.js`
