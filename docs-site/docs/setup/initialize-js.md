---
sidebar_position: 2
---

# NPM + JS

This method utilises JavaScript in non-React projects to initialize the SDK. Installation is available through NPM, and SDK initialization is via the `.init()` method.

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

You now have two options for tracking events:

1. You can utilise the [default configuration options](/guides/automatic) for automatic tracking, or
2. [Begin tracking events manually](/category/5-tracking-events) for more fine-grained control
