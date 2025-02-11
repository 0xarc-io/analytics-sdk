---
sidebar_position: 7
---

# `.signature()`

Logs a signing event when a message is signed.

---

### Parameters

- `options` **(object)**
- `message` **(string)** - The message that was signed. This parameter is required and cannot be empty.
  - `signatureHash` **(string, optional)** - The hash of the signature. If not provided, it will be excluded from the event attributes.
- `account` **(string, optional)** - The account that signed the message. If not provided, the SDK will use the previously recorded account.

---

### Example

```ts
await sdk.signature({
  message: 'Hello, world!',
  signatureHash: '0x123abc',
  account: '0x123',
})
```
