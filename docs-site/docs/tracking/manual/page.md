---
sidebar_position: 2
---

# Page Events

Page events are emitted whenever there is a URL change during the session.

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

const PageEventTracker = () => {
  const sdk = useArcxAnalytics()

  const handlePageClick = async () => {
    await sdk.page()
  }

  return <button onClick={handlePageClick}>Track Page</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackPages: false })

await sdk.page()
```

---
