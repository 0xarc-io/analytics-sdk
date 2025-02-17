---
sidebar_position: 1
---

# Automatic vs Manual Tracking

### SDK Supported Event Types

In theory, the SDK supports automatic tracking of the following event types:

- [Page Events](/tracking/page)
- Click Events
- [Transaction Events](/tracking/transaction)
- [Signing Events](/tracking/signature)
- [Chain Change Events](/tracking/chain)
- [Wallet Connection Events](/tracking/wallet)

### Limitations of Automatic Tracking

In practice, automatic tracking is very limited:

- If you are using the React SDK, automatic tracking is only supported for the Page Events, and Click Events.
- If you are using the JavaScript SDK (`.init()` via either the Script Tag or the NPM package), automatic tracking for the other events is **only supported for MetaMask**.

## When to use Manual Tracking

Use [manual tracking](/category/5-tracking-events) if either of the following conditions are true:

1. You are using the React Provider and want to track any events that are not Click or Page Events
2. You want to track any wallets that are not MetaMask - regardless of which SDK method you are using
