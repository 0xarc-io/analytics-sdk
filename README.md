# ARCx Analytics SDK

The ARCx Analytics SDK is a utility that wraps around the 
[ARCx Analytics API](https://docs.arcx.money/#tag--analytics). It provides a
simple and seamless installation experience for partners looking to integrate
into ARCx.

Please contact us via [Discord](https://discord.gg/hfrbGzPyK8) to be issued an 
API key.

## Installation

```cli
npm install @arcxmoney/analytics --save
yarn add @arcxmoney/analytics
```

## Quickstart

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

## SDK Configuration
When the SDK is initialised via the `init` method, it can be optionally passed 
in a collection of configuration options.  The defaults the SDK picks are sensible for most use cases.

The configuration options are:

- `trackPages` **(boolean)** - tracks whenever there is a URL change during the session and logs it automatically. Defaults to `true`
- `cacheIdentity` **(boolean)** - caches the identity of users in the browser's local storage to capture cross-session behaviours. Defaults to `true`

## API

### `init`
To initialise the Analytics SDK one should invoke the `init` method on the 
class. This configures the SDK with your API key and, optionally, configuration
options.

**Parameters:**

- `apiKey` **(string)** - the ARCx-provided API key.
- `config` **(object)** - overrides of SDK configuration
  - `trackPages` **(boolean)** - automatically logs page visit events.
  - `cacheIdentity` **(boolean)** - captures cross-session behaviours.

```js
await analytics = await ArcxAnalyticsSdk.init(
  YOUR_API_KEY, // The ARCx-provided API key
  {
    trackPages: true,
    cacheIdentity: true,
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
  - `source` **optional(string)** - the ID used to indicate the traffic source.
  - `campaignId` **optional(string)** - the ID used to indicate the marketing campaign.

**Example:**

```js
await analytics.attribute({
  source: "discord",
  campaignId: "ama--2022-10-10",
})
```
