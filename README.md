[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![npm version](https://badge.fury.io/js/@0xarc-io%2Fanalytics.svg)](https://badge.fury.io/js/@0xarc-io%2Fanalytics) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

> The 0xArc Analytics SDK is a simple SDK that helps provide higher fidelity analytics by merging on-chain data with off-chain data from front-ends. We value user privacy and do not collect IP addresses or scrape any information without your permission.

# Documentation

- TODO link documentation once deployed

# Development notes

To run a local version of the script:

1. Run `yarn build` at the root level to build the script.
2. Run `yarn copy-build-example` to copy the built contents into the `example/cra-script-tag` project.
3. Make a copy of `.env.example` and rename it to `.env` in the `example/cra-script-tag` folder.
4. Make sure to add your 0xArc API + Alchemy keys to the `.env` file (find `YOUR_KEY_HERE`).
5. Run `cd example/cra-script-tag && yarn && yarn start` to start the example app.
