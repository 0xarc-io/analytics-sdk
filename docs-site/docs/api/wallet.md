---
sidebar_position: 3
---

# `.wallet()`

Logs when a user connects their wallet to the dApp.

---

### Parameters

- `attributes` **(object)**
  - `chainId` **(number)** - the chain ID to which this address is connected on.
  - `account` **(string)** - the address of the connected wallet on the supplied chain.

---

### Example

```js
await sdk.wallet({
  account: '0x123',
  chainId: 1,
})
```
