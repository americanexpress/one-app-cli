[one-app-dev]: https://hub.docker.com/r/oneamex/one-app-dev
[parrot]: https://github.com/americanexpress/parrot
[one-app-bundler]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler
[one-app-runner]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-runner
[express]: https://github.com/expressjs/express
[memfs]: https://github.com/streamich/memfs
[webpack]: https://github.com/webpack/webpack
[webpack-dev-middleware]: https://github.com/webpack/webpack-dev-middleware
[webpack-hot-middleware]: https://github.com/webpack-contrib/webpack-hot-middleware
[webpack-bundle-analyzer]: https://github.com/webpack-contrib/webpack-bundle-analyzer
[react-refresh-webpack-plugin]: https://github.com/pmmmwh/react-refresh-webpack-plugin
[react-refresh]: https://github.com/facebook/react/tree/master/packages/react-refresh
[react-refresh-troubleshooting]: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md
# @americanexpress/one-app-hmr

`@americanexpress/one-app-hmr` is an **experimental** development server
made for One App Holocron modules - geared for a UX/UI focused workflow
and collaborative efforts that require fast refresh and re-loadable
assets for immediate feedback looping.

If you are looking for a **production-like environment**
to run One App Holocron modules, [`@americanexpress/one-app-runner`][one-app-runner] would be the right tool of choice.

## 📖 Table of Contents

* [Features](#-features)
* [Usage](#-usage)
* [API](#%EF%B8%8F-api)
* [Troubleshooting](#-troubleshooting)

## ✨ Features

- experimental development server that runs One App Holocron modules
- zero-config start up with pre-existing `"one-amex"` configuration in the `package.json`
- pre-loads One App development statics being sourced from Docker image [`oneamex/one-app-dev`](one-app-dev) by default
- [fast refresh][react-refresh] for Holocron modules, React components and styles are all hot loaded in the browser
- re-loadable [parrot] scenarios are watched for changes for the local modules
- re-loadable language packs are watched for changes for the local modules
- remote module map can be used to proxy + load (and cache) remote resources and afterwards combine the remote module map with the universal map
- provided/required externals are pre-built as a DLL bundle to speed up build times of the local modules
- local Holocron modules bundles are analyzed and reported for inspection

### Caveats
- Both parrot scenario and language pack updates need page reload to reflect
- custom `babel` config is not supported nor auto-merged (with zero-config)
- custom [webpack] config is not supported nor auto-merged (with zero-config)
- providing environment variables is not supported nor auto-merged (with zero-config)

## 🤹‍ Usage

> **Prerequisites**
> - Docker is required to load the development One App statics
> - React Dev tools extension is needed in your browser for fast refresh to work

### Installation

```bash
npm install -D @americanexpress/one-app-hmr

# or

yarn add -D @americanexpress/one-app-hmr
```

### Start Up

add the script in the `package.json` of your Holocron module:

```json
{
  "one-amex": { /* ... */ },
  "scripts": {
    "dev": "one-app-hmr"
  }
}
```

then run to start the development server:

```bash
npm run dev

# or

yarn dev
```

Once the command is executed, the sandbox Holocron module reload server
will start up using the configuration found in the modules `package.json`.

## 🎛️ API

**The API is subject to change**

### `one-app-hmr`

Command line tool usage.
#### Usage

```bash
npx -p @americanexpress/one-app-hmr -- one-app-hmr
```

#### Configuration

**Zero-Config**

`one-app-hmr` uses pre-existing configuration from `"one-amex"`
to source what modules, externals and other configuration like
`rootModuleName` are used.

The config is based on [`one-amex.runner`][one-app-runner] (`modules`, `rootModuleName`, `moduleMapUrl`, `dockerImage`)
and [`one-amex.bundler`][one-app-bundler] (`providedExternals`, `requiredExternals`)
to set up the HMR environment for your Holocron module.

If a `mock/scenarios.js` exists in your module,
the `parrot` scenarios will be watched for changes and updated.
The same applies if `locale/*` folder exists in your Holocron module.
When a given locale is modified, the dev server will notify the client
and will load the language pack into state.

There is an `one-amex.hmr` config that can be used for
more advanced configurations. The experimental `hmr` config is
subject to change, here are currently supported fields:

```json
{
  "one-amex": {
    "hmr": {
      "logLevel": "info", // or 4, 'log' or 3, 'warn' or 2, 'error' or 1, 0 for silent
      "port": 4000, // the port that the holocron dev server binds to
      "openWhenReady": false, // set to true to enable opening your default browser when ready
    }
  }
}
```

### Node API

The main exports to set up your own development server.

* `createConfig`
* `sandboxServer`
* `setLogLevel`

**Example**

```js
import { createConfig, sandboxServer, setLogLevel } from '@americanexpress/one-app-hmr';

(async function startDevServer() {
  setLogLevel(0);
  const config = await createConfig();
  const [app, server] = await sandboxServer({
    ...config,
    port: 3001,
  });
}());
```

`sandboxServer` takes in the configuration of the `one-amex.hmr`
key config and follows the same API.

Once `webpack` has completed the build and has been logged,
navigate to `http://localhost:3001` (`4000` is the default port).

#### Server Spec

- [`express`][express] server listening for requests: handling request types for navigation, static assets and [parrot] scenarios
- [`webpack`][webpack], [`webpack-dev-middleware`](webpack-dev-middleware) and [`webpack-dev-middleware`](webpack-dev-middleware) load a configuration for fast refresh, added with [`react-refresh`][react-refresh] via `babel` and [`@pmmmwh/react-refresh-webpack-plugin react-refresh`][react-refresh-webpack-plugin] via [webpack]
- [`webpack-bundle-analyzer`](webpack-bundle-analyzer) is available for the local Holocron modules that are being watched + bundled and the externals, if any (separately)
- [`memfs`][memfs] used in parity with [webpack] to serve local and remote static assets from memory

## Troubleshooting

There may be instances where fast refresh may stop working
for various reasons, check out the
[troubleshooting guide from `@pmmmwh/react-refresh-webpack-plugin react-refresh`](react-refresh-troubleshooting)
for debugging tips.

If any issues persist, try removing the `static` directory generated
and run the development server again.
