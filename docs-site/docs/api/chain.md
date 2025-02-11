---
sidebar_position: 5
---

# `.chain()`

Logs when there is a change in the blockchain the user’s wallet is connected to. This function is instrumental in tracking user behaviour associated with different chains, facilitating a richer analysis in your 0xArc analytics setup.

---

### Parameters

- `attributes` **(object)**
  - `chainId` **(number | string)** - The updated chain ID to which the wallet is connected. It should be provided in either a hexadecimal or decimal format to facilitate the change log. This parameter is mandatory to invoke the function.
  - `account` **(string, optional)** - The account associated with the chain change event. If not specified, the function automatically resorts to using the previously recorded account from the last `connectWallet()` call or retrieves it from Metamask if it’s in use and the `trackWalletConnections` config is turned on.

---

### Example

```ts
sdk.chain({ chainId: '1', account: '0x1234' })
```
