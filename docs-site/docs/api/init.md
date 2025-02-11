---
sidebar_position: 1
---

# `.init()`

To initialize the Analytics SDK one should invoke the `init` method on the
class. This configures the SDK with your API key and, optionally, configuration
options.

**Note**: you do not need to call this function if using the React provider. But the configuration options below are instead passed into the `config` prop of the `ArcxAnalyticsProvider` component. See [here](/react/sdk-configuration-react#configuration-options) for React usage.

---

### Parameters

- `apiKey` **(string)** - the 0xArc-provided API key. See [here](/retrieve-api-key) for instructions on how to retrieve your API key.
- `config` **(object)** - overrides of the default SDK configuration for [react](/react/sdk-configuration-react) or [manual](/manual/sdk-configuration-manual) usage.

---

### Example

```ts
await sdk = await ArcxAnalyticsSdk.init(
  'YOUR_API_KEY', // The 0xArc-provided API key
  {
    cacheIdentity: true,
    trackReferrer: true,
    trackPages: true,
    trackUTM: true,
    trackTransactions: true,
  }
)
```

---

### Configuration Options

| Config key               | Type    | Description                                                                                     | Default |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------- | ------- |
| `cacheIdentity`          | boolean | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`  |
| `trackPages`             | boolean | Tracks whenever there is a URL change during the session and logs it automatically.             | `true`  |
| `trackWalletConnections` | boolean | Automatically track wallet connections (Metamask only)                                          | `true`  |
| `trackChainChanges`      | boolean | Automatically track chain ID changes (Metamask only)                                            | `true`  |
| `trackTransactions`      | boolean | Automatically track transaction requests (Metamask only)                                        | `true`  |
| `trackSigning`           | boolean | Automatically track signing requests (Metamask only)                                            | `true`  |
| `trackClicks`            | boolean | Automatically track click events                                                                | `true`  |
