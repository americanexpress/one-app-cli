[one-app-dev]: https://hub.docker.com/r/oneamex/one-app-dev
[parrot]: https://github.com/americanexpress/parrot
[One App]: https://github.com/americanexpress/one-app
[one-app-bundler]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler
[dll plugin]: https://webpack.js.org/plugins/dll-plugin/
[providedExternals & requiredExternals]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler#providedexternals--requiredexternals
[one-app-runner]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-runner
[express]: https://github.com/expressjs/express
[memfs]: https://github.com/streamich/memfs
[webpack]: https://github.com/webpack/webpack
[webpack-dev-middleware]: https://github.com/webpack/webpack-dev-middleware
[webpack-hot-middleware]: https://github.com/webpack-contrib/webpack-hot-middleware
[webpack bundle analyzer]: https://github.com/webpack-contrib/webpack-bundle-analyzer
[react-refresh-webpack-plugin]: https://github.com/pmmmwh/react-refresh-webpack-plugin
[react-refresh]: https://github.com/facebook/react/tree/master/packages/react-refresh
[react-refresh-troubleshooting]: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md
[docker]: https://www.docker.com/
[React Dev tools extension]: https://reactjs.org/blog/2019/08/15/new-react-devtools.html
# @americanexpress/holocron-dev-server

`@americanexpress/holocron-dev-server` is an **experimental** development server
made for [One App][One APP] Holocron modules designed for enabling fast refresh and reloading of assets
while creating web experiences.

If you are looking for a **production-like environment**
to run One App Holocron modules, [`@americanexpress/one-app-runner`][one-app-runner] would be the right tool of choice.

## 📖 Table of Contents

* [Features](#-features)
* [Usage](#-usage)
* [API](#%EF%B8%8F-api)
* [Troubleshooting](#-troubleshooting)

## ✨ Features

- [Fast refresh][react-refresh] for Holocron modules, React components and styles are all hot loaded in the browser.
- Experimental development server that runs One App Holocron modules.
- Zero-config start up with pre-existing `"one-amex"` configuration in the `package.json`.
- Pre-loads One App development statics from Docker image [`oneamex/one-app-dev`](one-app-dev) by default.
- Hot reload [parrot][parrot] scenarios and watch for changes.
- Hot reload language packs and watch for changes from the local modules.
- Combines the remote module if provided with the local module map.
 remote module map with the universal map
- [providedExternals & requiredExternals][providedExternals & requiredExternals] are pre-built as a [DLL][dll plugin] bundle to speed up build times of the local modules
- local Holocron modules bundles analyzed and reported using [webpack bundle analyzer][webpack bundle analyzer]

### Caveats
- No support for custom `babel` config or auto-merge option (with zero-config)
- No support for providing environment variables or an auto-merge (with zero-config)

## 🤹‍ Usage

> **Prerequisites**
> - [Docker][docker] is required to load One App statics from development environment.
> - [React Dev tools browser extension][React Dev tools extension] is needed in your browser for fast refresh to work

### Installation

```bash
npm install -D @americanexpress/holocron-dev-server

# or

yarn add -D @americanexpress/holocron-dev-server
```

### Start Up

add the script in the `package.json` of your Holocron module:

```json
{
  "scripts": {
    "dev": "holocron-dev-server"
  }
}
```

then run to start the development server:

```bash
npm run dev

# or

yarn dev
```

Once the command runs, the sandbox Holocron module reload server
will start up using the configuration found in the modules `package.json`.

## 🎛️ API

**The API is subject to change**

### `holocron-dev-server`

Command line tool usage.
#### Usage

```bash
npx -p @americanexpress/holocron-dev-server -- holocron-dev-server
```

#### Configuration

**Zero-Config**

`holocron-dev-server` uses existing configurations from `"one-amex"`
to source what modules, externals and other configuration like
`rootModuleName` are used.

The config uses [`one-amex.runner`][one-app-runner] (`modules`, `rootModuleName`, `moduleMapUrl`, `dockerImage`)
and [`one-amex.bundler`][one-app-bundler] (`providedExternals`, `requiredExternals`)
to set up the HMR environment for your Holocron module.

### Parrot Scenarios
If a `mock/scenarios.js` exists in your module,
the `parrot` scenarios will be watched for changes and updated,
please note that the parrot browser extension will need to be changed to refer 
to the port used by the holocron development server.

### Language Packs
The same applies if `locale/*` folder exists in your Holocron module.
When a given locale gets modified, the holocron dev server will notify the client
and will load the language pack into state.

### Advanced Configuration
Use the `one-amex.hmr` config for
more advanced configurations. The experimental `hmr` config is
subject to change. The options supported are:

##### Options

| name | type | required | value |
|---|---|---|---|
| `logLevel` | `String` | `false` | `info` or `4`, `log` or `3`, `warn` or `2`, `error` or `1`, `0` for silent |
| `port` | `Number` | `false` |the port that the holocron dev server binds to |
| `openWhenReady` | `Boolean` | `false` | Set to `true` to enable opening your default browser when ready |

```json
{
  "one-amex": {
    "hmr": {
      "logLevel": "info",
      "port": 4000,
      "openWhenReady": false,
    }
  }
}
```

#### Server Spec

- [`express`][express] server listening for requests: handling request types for navigation, static assets and [parrot] scenarios
- [`webpack`][webpack], [`webpack-dev-middleware`][webpack-dev-middleware] and [`webpack-dev-middleware`](webpack-dev-middleware) load a configuration for fast refresh, added with [`react-refresh`][react-refresh] via `babel` and [`@pmmmwh/react-refresh-webpack-plugin react-refresh`][react-refresh-webpack-plugin] via [webpack]
- [`webpack-bundle-analyzer`][webpack bundle analyzer] is available for the local Holocron modules that are being watched + bundled and the externals, if any (separately)
- [`memfs`][memfs] used in parity with [webpack] to serve local and remote static assets from memory

## Troubleshooting

There may be instances where fast refresh may stop working
for various reasons, check out the
[troubleshooting guide from `@pmmmwh/react-refresh-webpack-plugin react-refresh`](react-refresh-troubleshooting)
for debugging tips.

If any issues persist, try removing the `static` directory generated
and run the development server again.
