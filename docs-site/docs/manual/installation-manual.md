---
sidebar_position: 2
---

# Installation (via NPM)

Use this method if you are not using React.

---

### 1. Install the NPM package

###### via NPM

```bash
npm install @0xarc-io/analytics --save
```

or

###### via YARN

```bash
yarn add @0xarc-io/analytics
```

---

### 2. Import the SDK class

```tsx
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'
```

---

### 3. Initialize the SDK

Initialize the SDK and keep an instance of it ready to reference in other parts of your app. To do this, add the following code on your app’s load:

```tsx
const sdk = await ArcxAnalyticsSdk.init('API_KEY', {
  // list any features you'd like to disable here
  trackPages: false,
  trackWalletConnections: false,
})
```

---

### 4. Configure the API key

If you haven't already, you can retrieve your API key by following the instructions in the [Retrieve your API Key](/retrieve-api-key) docs.

Once you have your API key, pass the value of the `API_KEY` argument in the code snippet above to your API key.

Note that the api key is required. The key is a string that uniquely identifies your project. Since it is a public key, you can safely expose it to the client.

---

### 5. Start tracking

You are now ready to go! You can now [configure automatic tracking features in the SDK](/manual/sdk-configuration-manual) or start [manually tracking blockchain and custom events](/category/api-methods).
