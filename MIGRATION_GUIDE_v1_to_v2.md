# Migrating From v1 to v2

Upgrade to v2 for bug fixes, new features, and better data quality. The SDK v2 has more focused tracking mechanisms, requiring manual calls for web3 events beyond Metamask.

## New Data Collected

- **Signature Hash**: Optionally pass in `signature()`.
- **Device Info**: Including user agent, language, browser data, OS, and resolution.

## Technical Changes

#### Changed

- `connectWallet()` -> `wallet()`: Function renamed.
- `transaction()`: Param `chain` renamed to `chainId`

#### Removed

- `setProvider()`: Use script tag only for Metamask support.
- `referrer()`, `attribute()`: Now automatically tracked.
- Config options: `trackReferrer`, `trackUTM`.

#### Added

- `chain()`: To track chain changes.
- `signature()`: To track signature events.
- `disconnection()`: New function to track wallet disconnects.

## Migration Guide

### For Metamask-only dApps

You're set with the script tag. No changes needed.

### For dApps with Multiple Providers

#### Script Tag Users

1. Save your API key from the existing script tag.
2. Remove the script tag from your codebase

**For React Users**

- Follow [Option 2](https://github.com/0xarc-io/analytics-sdk#option-3-via-manual-instantiation) to install. Use the saved API key like this: `<ArcxAnalyticsProvider apiKey={YOUR_API_KEY} />`.

**For Non-React Users**

- Check out [Option 3](https://github.com/0xarc-io/analytics-sdk#option-3-via-manual-instantiation) for installation steps.

#### NPM Package Users

1. Update package:
   - `yarn add @0xarc-io/analytics@^2.2.3` or
   - `npm install @0xarc-io/analytics@^2.2.3`
2. Remove: `setProvider()`
3. Remove `trackReferrer`, `trackUTM` from the `config` param on the `ArcxAnalyticsProvider`, if present.
4. Rename: `connectWallet()` -> `wallet()`.
5. Implement: `transaction()`, `wallet()`, `chain()`, `signature()`.

[Consult the API Docs for more info](https://github.com/0xarc-io/analytics-sdk)
