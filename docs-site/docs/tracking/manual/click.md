---
sidebar_position: 9
---

# Click Events

Click Events are logged whenever a user clicks on an element on the page.

Click Events are automatically tracked, and can be disabled by setting the `trackClicks` config option to `false`.

---

## Manual Tracking

Note that no `.click()` method exists in the SDK instance at this moment, and can instead be tracked as a manual event:

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.event('CLICK', {
      element: 'button',
      elementId: 'submit-button',
    })
  }

  return (
    <button id="submit-button" onClick={handleClick}>
      Click me
    </button>
  )
}
```

### JS Example

```tsx
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY')

await sdk.event('CLICK', {
  element: 'button',
  elementId: 'submit-button',
})
```
