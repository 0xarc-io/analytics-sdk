---
sidebar_position: 3
---

# Wallet Connection Events

Wallet Connection Events are logged whenever a user connects their wallet to the dApp.

These must be manually tracked when using the NPM package.

Wallet connections are automatically tracked for MetaMask only, when using the [Script Tag method](/installation/installation-script). To disable automatic tracking in the Script Tag, set the [`trackWalletConnections`](/guides/automatic#configuration-options) config option to `false`.

---

## Basic Usage

To manually track wallet connection events, use the `.wallet()` method on the SDK instance.

### Parameters

- `attributes` **(object)**
  - `chainId` **(number | string)** - the chain ID to which this address is connected on.
  - `account` **(string)** - the address of the connected wallet on the supplied chain.

---

### React Example

Below is a basic example of how to track a wallet connection event.

```tsx
import { useWeb3React } from '@web3-react/core'
import { useArcxAnalytics } from '@0xarc-io/analytics'

const WalletConnectionTracker = () => {
  const { account, chainId } = useWeb3React()
  const sdk = useArcxAnalytics()

  // Effect runs when `account` or `chainId` changes
  // Once the chainId and account values are available, track the wallet connection with the SDK
  // As the wallet is now connected
  useEffect(() => {
    if (account && chainId && sdk) {
      sdk.wallet({
        chainId,
        account,
      })
    }
  }, [account, chainId, sdk]) // Re-run this effect if account or chainId changes

  return <div>Tracking wallet connections with useWeb3React.</div>
}
```

Note: the `useWeb3React` hook is not required to track wallet connections. You can use any library you want to get the `account` and `chainId` values. This library is for demonstration purposes, from the [Uniswap web3-react library](https://github.com/Uniswap/web3-react).

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackWalletConnections: false })

await sdk.wallet({
  account: '0x123',
  chainId: 1,
})
```
