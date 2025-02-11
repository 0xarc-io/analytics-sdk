---
sidebar_position: 6
---

# `.transaction()`

Logs when a transaction is submitted by a user.

---

### Parameters

- `attributes` **(object)**
  - `chainId` **(string | number)** - the chain ID where the transaction took place.
  - `transactionHash` **(string)** - the transaction hash of the transaction.
  - `metadata` **(object)** - an optional collection of transaction metadata that you wish to capture.

---

### Example

```ts
await sdk.transaction({
  chainId: 1,
  transactionHash: '0xABCabc123',
})
```
