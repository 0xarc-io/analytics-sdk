---
sidebar_position: 2
---

# Tracking Transactions

Tracking transactions is a common goal, but is not always straightforward.

This guide explains to how to track transactions, and when it can be insufficient to use automatic tracking (via the Script Tag) versus using manual tracking - via the `.transaction()` method to track submitted transactions, combined with the `.event()` custom event method to track every step of the transaction process.

## Limitations of automatic tracking via the Script Tag

A reminder that the automatic tracking of transactions is only possible via the Script tag for MetaMask.

With the `trackTransactions` configuration option for the Script tag, and the `.transaction()` event, you can only track the transaction after it's **submitted**. So you'd miss the opportunity to track the transaction at the point of **trigger**.

## Why manual tracking is recommended

A common goal is track when a user has deposited funds into their wallet. ie the transaction is **submitted**.

But you may also want to track when a user **triggers** a transaction, but leaves the app before the transaction is **submitted**.

Therefore if we only log confirmed transactions, we don't know why users abandon transactions, or where they drop off. To solve this, we can use custom events (`.event()`) to track every step of the transaction process.

---

## How to track the transaction process

Instead, to capture every step of the transaction process, you can use custom events `.event()` combined with the `.transaction()` method.

For example, when a user initiates/**triggers** a transaction, you can log this using the `.event()` method:

### React Example

```tsx
import { useArcxAnalytics } from '@0xarc-io/analytics'

const Component = () => {
  const sdk = useArcxAnalytics()

  const handleClick = async () => {
    await sdk.event('TRANSACTION_TRIGGERED', {
      transactionHash: '0x1234567890abcdef',
      chainId: 1,
      metadata: {
        apiVersion: 'v1',
      },
    })
  }

  return <button onClick={handleClick}>The user triggers a transaction</button>
}
```

### JS Example

```ts
import { ArcxAnalyticsSdk } from '@0xarc-io/analytics'

const sdk = await ArcxAnalyticsSdk.init('YOUR_API_KEY')

await sdk.event('TRANSACTION_TRIGGERED', {
  transactionHash: '0x1234567890abcdef',
  chainId: 1,
  metadata: {
    apiVersion: 'v1',
  },
})
```

Note that the `.event()` method is more flexible than the `.transaction()` event and allows us to name the event whatever we want, and add any metadata we want. See the [`.event()` docs](/tracking/manual/event) for more info.

After the user triggers a transaction, you can log the transaction being **submitted** using the `.transaction()` method as usual as outlined in the [`.transaction()` docs](/tracking/manual/transaction). The `.transaction()` method is used to log only submitted transactions, and not other steps in the transaction process.

_Note that tracking the submitted transaction manually via the `.transaction()` method will be more reliable than us automatically tracking the events emitted by MetaMask via the Script Tag, as you have more fine-grained control over when events take place._

Now we have a complete picture of the transaction process from the point of **trigger** to **submission**. This allows us to capture how many users are starting a transaction vs completing it, and figuring out potential drop off points.

We can add additional events between the trigger and submission to capture more information as desired. See the [Custom Events Guide](/guides/custom-events) for more info.

For example, we can track when a user pops up the MetaMask modal before initiating a transaction:

### React Example

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

We call the custom event `DEPOSIT_ATTEMPED` to indicate that the user attempted to deposit funds. Again, we can name the custom event whatever we want, and add any metadata we want. The values above are for demonstration purposes.

---

## Crafting the Transaction Hash

If you want to track the transaction hash before the user has actually submitted the transaction, as we've done above, we can utilise the transaction hash via your frontend code by crafting an unsigned transaction.

For example, via the [ethers library](https://docs.ethers.org/v5/api/utils/transactions/) or whichever library you're using.

This is possible since the transaction hash is deterministic based on the input parameters (and not the signature), meaning it can be generated before signing.

---

## Confirming a Submitted Transaction

Although you can track the transaction hash manually for a **submitted transaction**, this is not necessarily required, since 0xArc pre-indexes all transaction data from the blockchain to match transaction hashes and confirm if a transaction was completed or not.

But for us to match the transaction hash from the submitted transactions to your custom events emitted from your frontend, we need to ensure that the matching transaction hash is logged via your frontend code.
