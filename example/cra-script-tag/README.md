This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Usage of 0xArc Analytics through a script tag

Simply add the following script in the header of your application:

```html
<script>
  const script = document.createElement('script')
  const apiKey = YOUR_API_KEY
  script.src = 'https://unpkg.com/@arcxmoney/analytics'
  script.onload = function () {
    ArcxAnalyticsSdk.init(apiKey).then(function (sdk) {
      window.arcx = sdk
    })
  }

  document.head.appendChild(script)
</script>
```

You must replace `YOUR_API_KEY` with your API key as specified in the [SDK's documentation](https://github.com/0xarc-io/analytics-sdk) and, optionally, pass a `config` object. This is the same `config` as described [here](https://github.com/0xarc-io/analytics-sdk#init).

Then, you will have access to the `window.arcx` which is an instance of the SDK, which API is described [here](https://github.com/0xarc-io/analytics-sdk#api).
