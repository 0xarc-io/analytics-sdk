---
sidebar_position: 9
---

# FAQ

### How do you identify a users session before they connect a wallet?

When a user first lands on your website, the SDK creates a unique identifier (aka Identity) for them and stores it in their browser's session storage.

This identifier is then used to identify the user across page views, clicks, and other events before they connect their wallet.

When the user connects their wallet, it is linked to their existing Identity - so we can link all of their off-chain activity before connecting.
