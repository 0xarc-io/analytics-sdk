---
sidebar_position: 1
---

# Custom Events

This guide contains best practices for naming and using custom events.

For the API usage of custom events, please refer to the [Custom Events](/tracking/manual/event) docs.

---

# What is a Custom Event?

Custom events are a way to track specific actions or interactions that occur in your application. They are extremely flexible, and can be used to track any off-chain or on-chain event in your application.

There are two parts to custom events, the event name itself, and the custom event attributes.

There are two parts to custom events, the event name itself, and the custom event attributes.

For example, let's say we we want to log a custom event when a user opens the MetaMask modal. Let's call it something like "deposit attempted".

##### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.event('DEPOSIT_ATTEMPED', {
      transactionHash: '0x1234567890abcdef',
      chainId: 1,
      metadata: {
        apiVersion: 'v1',
      },
    })
  }

  return <button onClick={handleClick}>User opens MetaMask modal</button>
}
```

You can see that we used the `sdk.event()` method to log the custom event. The first string argument `'DEPOSITED_ATTEMPTED'` is the custom event name, and we can name it anything we want. The second argument is an optional object of custom event attributes, which are arbitrary key-value pairs that you can use to add any additional information about the events.

---

## Naming events

There are no strict rules on how to name custom events, but here are some best practices:

### Consistency

No matter which naming conventions you choose to use for your custom events, it is important to be consistent. Consistent naming makes it easier to track event behaviour over time and understand your data.

If event names are inconsistent or change often, it becomes difficult to understand the data and the meaning of the events.

### Casing

The recommended approach to casing for events is to use capitalized snake_case for the event name, and camelCase for the event attribute keys:

- Event name: "deposit attempted" becomes `DEPOSIT_ATTEMPTED`
- Event attributes:
  - "transaction hash" becomes `transactionHash`
  - "chain ID" becomes `chainId`

By using capitalized snake_case for the event name, it appears more readable, indicates that it's a constant and that it's value does not change over time.

### Use Noun-Verb Structure for Custom Event Names

When naming events, use a noun-verb structure rather than a verb-noun structure. This makes it easier to group the actions by event or noun type.

| Event                 | ✅ Good naming (noun-verb) | ❌ Bad naming (verb-noun) |
| --------------------- | -------------------------- | ------------------------- |
| Wallet connected      | `WALLET_CONNECTED`         | `CONNECT_WALLET`          |
| Wallet disconnected   | `WALLET_DISCONNECTED`      | `DISCONNECTED_WALLET`     |
| Transaction submitted | `TRANSACTION_SUBMITTED`    | `SUBMITTED_TRANSACTION`   |
| Transaction confirmed | `TRANSACTION_CONFIRMED`    | `CONFIRMED_TRANSACTION`   |
| Token approved        | `TOKEN_APPROVED`           | `APPROVED_TOKEN`          |

As you can see, noun-verb structure makes it easier to group and analyze related events together.

---

## Custom Events and funnels
