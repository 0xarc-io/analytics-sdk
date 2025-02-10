---
sidebar_position: 8
---

# `.event()`

A generic, catch-all `event` log. Use this method when no existing methods
satisfy your requirements. This method can be used to track any event that you want.

---

### Parameters

- `event` **(string)** - the ID used to track this specific event.
- `attributes` **(object)** - an arbitrarily structured object of event information.

---

### Example

```js
await sdk.event('CHANGED_PFP', {
  oldPFP: 'dingo',
  newPFP: 'unicorn',
})
```
