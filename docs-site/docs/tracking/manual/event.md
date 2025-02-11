---
sidebar_position: 8
---

# Custom Events

A generic, catch-all `event` log. Use this method when no existing methods
satisfy your requirements. This method can be used to track any event that you want.

---

## Basic Usage

To manually track custom events, use the `.event()` method on the SDK instance.

### Parameters

- `event` **(string)** - the ID used to track this specific event.
- `attributes` **(object)** - an arbitrarily structured object of event information.

---

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.event('CHANGED_PFP', {
      oldPFP: 'dingo',
      newPFP: 'unicorn',
    })
  }

  return <button onClick={handleClick}>Send Event</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY')

await sdk.event('CHANGED_PFP', {
  oldPFP: 'dingo',
  newPFP: 'unicorn',
})
```
