---
sidebar_position: 1
---

# Automatic Tracking

Whether you initialize the SDK via the React Provider, Script Tag, or manually with JavaScript, the SDK will automatically track certain events:

- Page Events
- Click Events
- Wallet Connection Events
- Chain Change Events
- Transaction Events
- Signing Events

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

---

### Configuration Options

| Config key               | Type    | Description                                                                                     | Default | React | JS  |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------- | ------- | ----- | --- |
| `cacheIdentity`          | boolean | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`  | ✅    | ✅  |
| `trackPages`             | boolean | Tracks whenever there is a URL change during the session and logs it automatically.             | `true`  | ✅    | ✅  |
| `trackWalletConnections` | boolean | Automatically track wallet connections (Metamask only)                                          | `true`  | ❌    | ✅  |
| `trackChainChanges`      | boolean | Automatically track chain ID changes (Metamask only)                                            | `true`  | ❌    | ✅  |
| `trackTransactions`      | boolean | Automatically track transaction requests (Metamask only)                                        | `true`  | ❌    | ✅  |
| `trackSigning`           | boolean | Automatically track signing requests (Metamask only)                                            | `true`  | ❌    | ✅  |
| `trackClicks`            | boolean | Automatically track click events                                                                | `true`  | ✅    | ✅  |
