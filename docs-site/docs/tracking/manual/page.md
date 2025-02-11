---
sidebar_position: 2
---

# Page Events

Page Events are logged whenever there is a URL change during the user's session.

These events are automatically tracked, and can be disabled by setting the [`trackPages`](/tracking/automatic#configuration-options) config option to `false`.

---

## Basic Usage

To manually track page events, use the `.page()` method on the SDK instance.

### Parameters

- (none)

---

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.page()
  }

  return <button onClick={handleClick}>Send Event</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackPages: false })

await sdk.page()
```
