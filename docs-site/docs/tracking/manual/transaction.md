---
sidebar_position: 6
---

# Transaction Events

Transaction Events are logged when a transaction is submitted by a user.

---

## Basic Usage

To manually track transaction submitted events, use the `.transaction()` method on the SDK instance.

### Parameters

- `attributes` **(object)**
  - `chainId` **(string | number)** - the chain ID where the transaction took place.
  - `transactionHash` **(string)** - the transaction hash of the transaction.
  - `metadata` **(object)** - an optional collection of transaction metadata that you wish to capture.

---

### React Example

```tsx
const TransactionButton = () => {
  const { account, chainId } = useWeb3React()
  const arcxAnalytics = useArcxAnalytics()

  const handleTransactionSubmit = async () => {
    // Example: Simulating a transaction call
    // In a real scenario, you would replace this with your transaction logic,
    // for example, using ethers.js or web3.js to interact with a smart contract

    const transactionHash = '0x023c0e7...' // Placeholder for the actual transaction hash

    // Assuming the transaction was successful and you have the hash
    // Now, track the transaction using the analytics SDK
    arcxAnalytics.transaction({
      transactionHash,
      account, // Optional: if not passed, the SDK will use the account from the last wallet() call
      chainId, // Optional: if not passed, the SDK will use the chainId from the last chain or wallet call
      metadata: {
        // Example metadata
        action: 'User Initiated Transaction',
      },
    })

    console.log('Transaction tracked!')
  }

  return <button onClick={handleTransactionSubmit}>Submit Transaction</button>
}
```

---

### JS Example

```ts
await sdk.transaction({
  chainId: 1,
  transactionHash: '0xABCabc123',
})
```
