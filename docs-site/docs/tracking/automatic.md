---
sidebar_position: 1
---

# Automatic Tracking

Note that automatic tracking is limited for the React and JavaScript SDKs, with only support for:

- Page Events
- Click Events

If you're using the Script tag, the SDK will in addition also track the following events - but only for MetaMask:

- Wallet Connection Events
- Chain Change Events
- Transaction Events
- Signing Events

See the [configuration options](/tracking/automatic#configuration-options) below for more information on what events are supported.

---

## Disable Automatic Tracking

### React

You can disable any automatic tracking feature you want by passing an optional `config` prop to the React provider (`ArcxAnalyticsProvider`).

Note that not all automatically tracked events can be disabled. See the React column in the [Configuration Options](#configuration-options) section for which can be disabled.

```tsx
<ArcxAnalyticsProvider
  apiKey="API_KEY"
  config={{
    trackPages: true,
  }}
>
  <App />
</ArcxAnalyticsProvider>
```

### JavaScript

You can disable any automatic tracking feature you want by passing an optional `config` parameter to the `init` function during the [SDK setup](/setup/setup-js#3-initialize-the-sdk).

The configuration options are passed into the `config` argument of the `ArcxAnalyticsSdk` function.

All of the configuration options are described in the [Configuration](/tracking/automatic#configuration-options) section below.

```ts
const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', {
  cacheIdentity: true,
  trackPages: true,
  trackWalletConnections: true,
  trackChainChanges: true,
  trackTransactions: true,
  trackSigning: true,
  trackClicks: true,
})
```

### Script Tag

If you're using the Script Tag, you can disable any automatic tracking feature you want by passing an optional `config` parameter to the `init` function during the [Script Tag Setup](/installation/installation-script).

```html
<script>
  const script = document.createElement('script')
  const apiKey = 'YOUR_API_KEY'

  // Add any configuration parameters you'd like here
  const config = {
    cacheIdentity: true,
    trackPages: true,
    trackWalletConnections: true,
    trackChainChanges: true,
    trackTransactions: true,
    trackSigning: true,
    trackClicks: true,
  }

  script.src = '<https://unpkg.com/@0xarc-io/analytics>'
  script.onload = function () {
    ArcxAnalyticsSdk.init(apiKey, config, 'script-tag').then(function (sdk) {
      window.arcx = sdk
    })
  }

  document.head.appendChild(script)
</script>
```

---

### Configuration Options

| Config key               | Type    | Description                                                                                     | Default | React | JS & Script Tag |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------- | ------- | ----- | --------------- |
| `cacheIdentity`          | boolean | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`  | ✅    | ✅              |
| `trackPages`             | boolean | Tracks whenever there is a URL change during the session and logs it automatically.             | `true`  | ✅    | ✅              |
| `trackWalletConnections` | boolean | Automatically track wallet connections (Metamask only)                                          | `true`  | ❌    | ✅              |
| `trackChainChanges`      | boolean | Automatically track chain ID changes (Metamask only)                                            | `true`  | ❌    | ✅              |
| `trackTransactions`      | boolean | Automatically track transaction requests (Metamask only)                                        | `true`  | ❌    | ✅              |
| `trackSigning`           | boolean | Automatically track signing requests (Metamask only)                                            | `true`  | ❌    | ✅              |
| `trackClicks`            | boolean | Automatically track click events                                                                | `true`  | ✅    | ✅              |
