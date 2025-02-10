---
sidebar_position: 2
---

# Manual / JS (via NPM)

Use this method if you are not using React.

---

### 1. Install the NPM package

###### via NPM

```
npm install @0xarc-io/analytics --save
```

or

###### via YARN

```
yarn add @0xarc-io/analytics
```

---

### 2. Import the SDK class

```jsx
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'
```

---

### 3. Initialize the SDK

Initialize the SDK and keep an instance of it ready to reference in other parts of your app. To do this, add the following code on your app’s load:

```jsx
const sdk = await ArcxAnalyticsSdk.init('API_KEY', {
  // list any features you'd like to disable here
  trackPages: false,
  trackWalletConnections: false,
})
```

---

3. Track the blockchain-related and custom events you want using the method list from step 2 above.
   [TODO]
