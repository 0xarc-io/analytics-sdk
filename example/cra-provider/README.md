This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Usage of ARCx Analytics React Provider

If you have a React app, one easy way to integrate the SDK is to simply add the `ArcxAnalyticsProvider` at the root of your application:

You must pass an `API_KEY` as specified in the [SDK's documentation](https://github.com/arcxmoney/analytics-sdk) and, optionally, a `config` object. This is the same `config` as described [here](https://github.com/arcxmoney/analytics-sdk#init).

```jsx
return (
    <ArcxAnalyticsProvider apiKey={API_KEY} config={config}>
        ...the rest of your app here
    </ArcxAnalyticsProvider>
)
```

Then, in children components, you will have access to the `useArcxAnalytics()` hook which exposes an instance of the SDK, as described by the API [here](https://github.com/arcxmoney/analytics-sdk#api).

## Note

You can test this app with the local package by linking it locally with [yarn link](https://classic.yarnpkg.com/lang/en/docs/cli/link/). If you face "two copies of react" problems, you can fix it by temporarily linking the `react` and `@types/react` folders in `/` to `/example/node_modules/{react,@types/react}`. You can do that by runinng:

1. In `example/node_modules/react`, run `yarn link`
2. In `example/node_modules/@types/react` run `yarn link`
3. In the project directory, run `yarn link react && yarn link @types/react && yarn`
