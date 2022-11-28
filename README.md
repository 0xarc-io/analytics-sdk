[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![npm version](https://badge.fury.io/js/@arcxmoney%2Fanalytics.svg)](https://badge.fury.io/js/@arcxmoney%2Fanalytics) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)


# ARCx Analytics SDK

The ARCx Analytics SDK is a utility that wraps around the 
[ARCx Analytics API](https://docs.arcx.money/#tag--analytics). It provides a
simple and seamless installation experience for partners looking to integrate
into ARCx.

Please contact us via [Discord](https://discord.gg/hfrbGzPyK8) to be issued an 
API key.

## Installation

To install with `npm`:

```
npm install @arcxmoney/analytics --save
```

To install with `yarn`:

```
yarn add @arcxmoney/analytics
```

## Quickstart

There are two way of using the `ArcxAnalyticsSdk`: directly and with a React `ArcxAnalyticsProvider`.

### Directly

```js
const analytics = await ArcxAnalyticsSdk.init(YOUR_API_KEY)

await analytics.attribute({ channel: 'twitter' })
await analytics.connectWallet({ account: '0x123', chain: 1 })
await analytics.transaction({
  chain: 1, 
  transactionHash: '0xABC123', 
  metadata: {
    usedSuggestedExchange: true
  }
})
```

### With the React Provider

Put the `ArcxAnalyticsProvider` anywhere at top of your component tree.

```jsx
// App.jsx
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics'

export default App = () => (
	<ArcxAnalyticsProvider apiKey={YOUR_APY_KEY}>
  	{/* Your other components here, such as <ChildComponent /> */}
  </ArcxAnalyticsProvider>
)
```

Then you can use the `useArcxAnalytics()` hook in all of its child components.

```jsx
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

An example how this is used can be found in the [example folder](https://github.com/arcxmoney/analytics-sdk/tree/main/example).

## SDK Configuration

When the SDK is initialised via the `init` method, it can be optionally passed 
in a collection of configuration options.  The defaults the SDK picks are sensible for most use cases.

The configuration options are:

| Config key               | Type    | Description                                                  | Default |
| ------------------------ | ------- | ------------------------------------------------------------ | ------- |
| `cacheIdentity`          | boolean | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`  |
| `trackReferrer`          | boolean | Wether or not to emit an initial `REFERRER` event containing the referrer attribute | `true`  |
| `trackPages`             | boolean | Tracks whenever there is a URL change during the session and logs it automatically. | `true`  |
| `trackUTM`               | boolean | Automatically reports the UTM tags (`utm_campaign, utm_medium, utm_source`) of the first page visit | `true`  |
| `trackWalletConnections` | boolean | Automatically track wallet connections. Currently only supporting Metamask. | `true`  |
| `trackChainChanges`      | boolean | Automatically track chain ID changes. Currenlty only supporting Metamask | `true`  |

## API

### `init`
To initialise the Analytics SDK one should invoke the `init` method on the 
class. This configures the SDK with your API key and, optionally, configuration
options.

**Note**: you do not need to call this function if using the React provider.

**Parameters:**

- `apiKey` **(string)** - the ARCx-provided API key.
- `config` **(object)** - overrides of SDK configuration
  - `trackPages` **(boolean)** - automatically logs page visit events.
  - `cacheIdentity` **(boolean)** - captures cross-session behaviours.

```js
await analytics = await ArcxAnalyticsSdk.init(
  YOUR_API_KEY, // The ARCx-provided API key
  {
    cacheIdentity: true,
    trackReferrer: true,
    trackPages: true,
    trackUTM: true
  }
)
```

### `event`
A generic, catch-all `event` log. Use this method when no existing methods 
satisfy your requirements.

**Parameters:**

- `event` **(string)** - the ID used to track this specific event.
- `attributes` **(object)** - an arbitrarily structured object of event information.

**Example:**

```js
await analytics.event(
  'CHANGED_PFP',
  {
    oldPFP: 'dingo',
    newPFP: 'unicorn', 
  }
)
```

### `page`
Allows manual logging page visit events. Only use this method when `trackPages` 
is set to `false`. 

**Parameters:**

- `attributes` **(object)**
  - `url` **(string)** - the new URL that the user has navigated to.

**Example:**

```js
await analytics.page({url: 'https://dapp.com/subpage/'})
```

### `connectWallet`
Logs when a user connects their wallet to the dApp.

**Parameters:**

- `attributes` **(object)**
  - `chain` **(string | number)** - the chain ID which this address applied to.
  - `account` **(string)** - the address of connected wallet on the supplied chain.

**Example:**

```js
await analytics.connectWallet({
  account: '0x123',
  chain: 1,
})
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
  source: "discord",
  campaign: "ama--2022-10-10",
})
```
