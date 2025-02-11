---
sidebar_position: 1
---

# Installation (via NPM)

React is the recommended way to use the SDK.

---

### 1. Install the NPM package

###### via NPM

```bash
npm install @0xarc-io/analytics --save
```

or

###### via YARN

```bash
yarn add @0xarc-io/analytics
```

---

### 2. Import the React Provider

Import the SDK React Provider at the top of your component tree

```tsx
import { ArcxAnalyticsProvider } from '@0xarc-io/analytics'
```

---

### 3. Wrap your tree with the provider

```tsx
import React from 'react'
import ReactDOM from 'react-dom'
import { ArcxAnalyticsProvider } from '@0xarc-io/analytics'
import App from './App' // Import your main App component

const apiKey = 'YOUR_API_KEY' // Replace with your actual 0xArc analytics API key

const RootComponent = () => (
  <ArcxAnalyticsProvider apiKey={apiKey}>
    <App />
  </ArcxAnalyticsProvider>
)

ReactDOM.render(<RootComponent />, document.getElementById('root'))
```

---

### 4. Pass your API Key to the provider

If you haven't already, you can retrieve your API key by following the instructions in the [Retrieve your API Key](/retrieve-api-key) docs.

Once you have your API key, pass it to the provider as a prop, as demonstrated in the example above.

Note that the `apiKey` prop is required. The key is a string that uniquely identifies your project. Since it is a public key, you can safely expose it to the client.

---

You are now ready to go! You can now [configure automatic tracking features in the SDK](/react/sdk-configuration-react) or start [tracking events manually](/react/usage-react).
