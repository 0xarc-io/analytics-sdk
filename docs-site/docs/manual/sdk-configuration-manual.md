---
sidebar_position: 2
---

# SDK Configuration

You can disable any automatic tracking feature you want by passing an optional `config` parameter either to the `init` function.

---

## Configuration Options

The configuration options are passed into the `config` argument of the `ArcxAnalyticsSdk` function.

All of the configuration options are the same as the ones described in the [Configuration](/api/init#configuration-options) docs.

---

## Example Usage

```jsx
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
