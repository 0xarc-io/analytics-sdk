---
sidebar_position: 3
---

# SDK Configuration

You can disable any automatic tracking feature you want by passing an optional `config` prop to the React provider.

---

## Configuration Options

The configuration options are passed into the `config` prop of the `ArcxAnalyticsProvider` component.

All of the configuration options are the same as the ones described in the [Configuration](/docs/api/init#configuration-options) docs.

---

## Example Usage

```jsx
<ArcxAnalyticsProvider
  apiKey="YOUR_API_KEY"
  config={{
    cacheIdentity: true,
    trackPages: true,
    trackWalletConnections: true,
    trackChainChanges: true,
    trackTransactions: true,
    trackSigning: true,
    trackClicks: true,
  }}
>
  <App />
</ArcxAnalyticsProvider>
```

---
