---
sidebar_position: 4
---

# `.disconnection()`

Logs a wallet disconnection event. This function will clear the cached known chain ID and account.

---

### Parameters

- `attributes` **(object, optional)**
  - `account` **(string, optional)** - The disconnected account address. If not provided, the function will use the previously recorded account address.
  - `chainId` **(string | number, optional)** - The chain ID from which the wallet was disconnected. If not passed, the function will use the previously recorded chain ID.

---

### Example

```ts
await sdk.disconnection({
  account: '0x123',
  chainId: 1,
})
```
