---
sidebar_position: 1
---

# React

React is the recommended way to use the SDK.

This method utilises a React Provider to initialize the SDK.

This method supports the [automatic tracking](/tracking/automatic) of Click & Page Events, and the [manual tracking](/category/manual-tracking) of all other events.

---

## 1. Import the React Provider

Import the SDK React Provider at the top of your component tree

```tsx
import { ArcxAnalyticsProvider } from '@0xarc-io/analytics'
```

---

## 2. Wrap your tree with the provider

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

If you haven't already, you can retrieve your API key by following the instructions in the [Retrieve your API Key](/retrieve-api-key) docs.

Once you have your API key, pass it to the provider as a prop, as demonstrated in the example above.

Note that the `apiKey` prop is required. The key is a string that uniquely identifies your project. Since it is a public key, you can safely expose it to the client.

---

## 3. Start tracking

You are now ready to go! You now have two options for tracking events:

1. You can utilise the [default configuration options](/tracking/automatic) for automatic tracking, and
2. [Begin tracking events manually](/category/manual-tracking) for more fine-grained control.

**Note that these 2 methods are not mutually exclusive** - as you can utilise automatic tracking for Click & Page Events, and manual tracking for all other events.
