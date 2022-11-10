This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Usage of ARCx Analyticx React Provider

If you have a React app, one easy way to integrate the SDK is to simply add the `ArcxAnalyticsProvider` at the root of your application:

You must pass an `API_KEY` as specified in the [SDK's documentation](https://github.com/arcxmoney/analytics-sdk) and, optionally, a `config` object. This is the same `config` as described [here](https://github.com/arcxmoney/analytics-sdk#init).

```jsx
return (
    <ArcxAnalyticsProvider apiKey={API_KEY} config={config}>
        <div>
            ...the rest of your app here
        </div>
    </ArcxAnalyticsProvider>
)
```

Then, in children components, you will have access to the `useArcxAnalytics()` hook which exposes an instance of the SDK, as described by the API [here](https://github.com/arcxmoney/analytics-sdk#api).

## Note

You can test this app with the local package by linking it locally with [yarn link](https://classic.yarnpkg.com/lang/en/docs/cli/link/). If you face "two copies of react" problems, you can fix it by temporarily deleting the `react` and `react-dom` folders inside `../node_modules`.

This is why there is a `rm ../node_modules/{react,react-dom}` at the beginning of the `start` script in `package.json`.
