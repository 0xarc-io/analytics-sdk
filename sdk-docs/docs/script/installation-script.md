---
sidebar_position: 1
---

# Installation (via CDN)

Please note that the script tag method only supports Metamask.

---

### 1. Add the script tag to your index.html

```html
<script>
  const script = document.createElement('script')
  const apiKey = 'YOUR_API_KEY'
  const config = {} // Add any configuration parameters you'd like here
  script.src = '<https://unpkg.com/@0xarc-io/analytics>'
  script.onload = function () {
    ArcxAnalyticsSdk.init(apiKey, config, 'script-tag').then(function (sdk) {
      window.arcx = sdk
    })
  }

  document.head.appendChild(script)
</script>
```

---

### 2. Configure the API key

If you haven't already, you can retrieve your API key by following the instructions in the [Retrieve your API Key](/docs/retrieve-api-key) docs.

Once you have your API key, set the value of the `apiKey` variable to your API key.

Note that the `apiKey` is required. The key is a string that uniquely identifies your project. Since it is a public key, you can safely expose it to the client.

---

That’s it! The 0xArc SDK will automatically detect wallet connections, referrer data, button clicks, page tracks and transactions that occur on your front-end.

You will now have access to the 0xArc SDK instance via `window.arcx` anywhere in the app, in case you want to use any specific functionality described in the [API Methods](/docs/category/api-methods) section.
