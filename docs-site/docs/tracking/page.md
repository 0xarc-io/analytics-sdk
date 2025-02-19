---
sidebar_position: 2
---

# Page Events

Page Events are logged whenever there is a URL change during the user's session.

These events are automatically tracked, and can be disabled by setting the [`trackPages`](/guides/automatic#configuration-options) config option to `false`.

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

  // Send page event when component mounts
  useEffect(() => {
    await sdk.page()
  }, [])

  return <button>Empty Button</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY', { trackPages: false })

await sdk.page()
```
