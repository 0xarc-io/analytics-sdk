---
sidebar_position: 1
---

# Automatic vs Manual Tracking

### SDK Supported Event Types

In theory, the SDK supports automatic tracking of the following event types:

- [Page Events](/tracking/manual/page)
- Click Events
- [Transaction Events](/tracking/manual/transaction)
- [Signing Events](/tracking/manual/signature)
- [Chain Change Events](/tracking/manual/chain)
- [Wallet Connection Events](/tracking/manual/wallet)

### Limitations of Automatic Tracking

In practice, automatic tracking is very limited:

- If you are using the React SDK, automatic tracking is only supported for the Page Events, and Click Events.
- If you are using the JavaScript SDK (`.init()` via either the Script Tag or the NPM package), automatic tracking for the other events is **only supported for MetaMask**.

## When to use Manual Tracking

Use [manual tracking](/category/manual-tracking) if either of the following conditions are true:

1. You are using the React Provider and want to track any events that are not Click or Page Events
2. You want to track any wallets that are not MetaMask - regardless of which SDK method you are using
