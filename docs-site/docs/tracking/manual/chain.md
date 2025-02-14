---
sidebar_position: 5
---

# Chain Change Events

Chain Change Events are logged whenever there is a change in the blockchain the user’s wallet is connected to.

This function is instrumental in tracking user behaviour associated with different chains, facilitating a richer analysis in the [0xArc Analytics App](https://app.0xarc.io).

These must be manually tracked when using the NPM package.

---

## Basic Usage

To manually track chain change events, use the `.chain()` method on the SDK instance.

### Parameters

- `attributes` **(object)**
  - `chainId` **(number | string)** - The updated chain ID to which the wallet is connected. It should be provided in either a hexadecimal or decimal format to facilitate the change log. This parameter is mandatory to invoke the function.
  - `account` **(string, optional)** - The account associated with the chain change event. If not specified, the function automatically resorts to using the previously recorded account from the last `connectWallet()` call or retrieves it from Metamask if it’s in use and the `trackWalletConnections` config is turned on.

---

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    sdk.chain({ chainId: '1', account: '0x1234' })
  }

  return <button onClick={handleClick}>Change Chain</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackChainChanges: false })

await sdk.chain({ chainId: '1', account: '0x1234' })
```
