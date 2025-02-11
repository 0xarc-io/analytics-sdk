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

### Example

```ts
await sdk.event('CHANGED_PFP', {
  oldPFP: 'dingo',
  newPFP: 'unicorn',
})
```
