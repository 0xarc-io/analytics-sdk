---
sidebar_position: 3
---

# Usage

All of the SDK methods are available on the object returned by the `useArcxAnalytics` hook.

---

### 1. Import the `useArcxAnalytics` React hook

```jsx
import { useArcxAnalytics } from '@0xarc-io/analytics'
```

---

### 2. Initialize the hook

Inside your React component, initialize the hook by calling `useArcxAnalytics()` and storing the result in a constant.

```jsx
const WalletConnectionTracker = () => {
  const sdk = useArcxAnalytics()

  return <div>Tracking wallet connections with useWeb3React.</div>
}
```

---

### 3. Track any events

For a full list of events, see the [API Methods](/category/api-methods) section.

See the [React Examples](/react/examples) section for how the API methods are used in practice.

---
