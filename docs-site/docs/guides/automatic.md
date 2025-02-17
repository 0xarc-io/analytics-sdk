---
sidebar_position: 3
---

# Disable Automatic Tracking

## React Provider

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

---

## `.init()` method

You can disable any automatic tracking feature you want by passing an optional `config` parameter to the `init` function during the SDK setup via either the [NPM package](/setup/initialize-js#3-initialize-the-sdk) or the [Script Tag](/installation/installation-script).

The configuration options are passed into the `config` argument of the `ArcxAnalyticsSdk` function.

All of the configuration options are described in the [Configuration](/guides/automatic#configuration-options) section below.

### NPM Package

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', {
  cacheIdentity: true,
  trackPages: false,
  trackWalletConnections: false,
  trackChainChanges: false,
  trackTransactions: false,
  trackSigning: false,
  trackClicks: false,
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
    trackPages: false,
    trackWalletConnections: false,
    trackChainChanges: false,
    trackTransactions: false,
    trackSigning: false,
    trackClicks: false,
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

## Configuration Options

| Config key               | Type    | Description                                                                                     | Default | React Provider | `.init()` Method |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------- | ------- | -------------- | ---------------- |
| `cacheIdentity`          | boolean | Caches the identity of users in the browser's local storage to capture cross-session behaviours | `true`  | ✅             | ✅               |
| `trackPages`             | boolean | Tracks whenever there is a URL change during the session and logs it automatically.             | `true`  | ✅             | ✅               |
| `trackClicks`            | boolean | Automatically track click events of any element on the page                                     | `true`  | ✅             | ✅               |
| `trackWalletConnections` | boolean | Automatically track wallet connections (Metamask only)                                          | `true`  | ❌             | ✅               |
| `trackChainChanges`      | boolean | Automatically track chain ID changes (Metamask only)                                            | `true`  | ❌             | ✅               |
| `trackTransactions`      | boolean | Automatically track transaction requests (Metamask only)                                        | `true`  | ❌             | ✅               |
| `trackSigning`           | boolean | Automatically track signing requests (Metamask only)                                            | `true`  | ❌             | ✅               |
