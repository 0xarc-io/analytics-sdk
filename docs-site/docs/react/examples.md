# Examples

### Track wallet connections

Below is a basic example of how to track a wallet connection event.

```tsx
const WalletConnectionTracker = () => {
  const { account, chainId } = useWeb3React()
  const sdk = useArcxAnalytics()

  useEffect(() => {
    if (account && chainId) {
      // Track the wallet connection with the SDK
      sdk.wallet({
        chainId,
        account,
      })
    }
  }, [account, chainId, sdk]) // Re-run this effect if account or chainId changes

  return <div>Tracking wallet connections with useWeb3React.</div>
}
```

---

### Track transactions

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
