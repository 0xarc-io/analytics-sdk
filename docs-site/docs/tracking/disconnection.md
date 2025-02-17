---
sidebar_position: 4
---

# Wallet Disconnection Events

Wallet Disconnection Events are logged whenever a user disconnects their wallet from the dApp.

This function will clear the cached known chain ID and account.

These must be manually tracked when using the NPM package.

---

## Basic Usage

To manually track wallet disconnection events, use the `.disconnection()` method on the SDK instance.

### Parameters

- `attributes` **(object, optional)**
  - `account` **(string, optional)** - The disconnected account address. If not provided, the function will use the previously recorded account address.
  - `chainId` **(number | string, optional)** - The chain ID from which the wallet was disconnected. If not passed, the function will use the previously recorded chain ID.

---

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.disconnection({
      account: '0x123',
      chainId: 1,
    })
  }

  return <button onClick={handleClick}>Send Event</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY')

await sdk.disconnection()
```
