---
sidebar_position: 7
---

# Signature Events

Signature Events are logged whenever a message is signed.

These must be manually tracked when using the NPM package.

Signing Events are automatically tracked for MetaMask only, when using the [Script Tag method](/installation/installation-script). To disable automatic tracking in the Script Tag, set the [`trackSigning`](/guides/automatic#configuration-options) config option to `false`.

---

## Basic Usage

To manually track signature events, use the `.signature()` method on the SDK instance.

### Parameters

- `options` **(object)**
  - `message` **(string)** - The message that was signed. This parameter is required and cannot be empty.
  - `signatureHash` **(string, optional)** - The hash of the signature. If not provided, it will be excluded from the event attributes.
  - `account` **(string, optional)** - The account that signed the message. If not provided, the SDK will use the previously recorded account.

---

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.signature({
      message: 'Hello, world!',
      signatureHash: '0x123abc',
      account: '0x123',
    })
  }

  return <button onClick={handleClick}>Send Event</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackSigning: false })

await sdk.signature({
  message: 'Hello, world!',
  signatureHash: '0x123abc',
  account: '0x123',
})
```
