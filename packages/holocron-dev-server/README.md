[one-app-dev]: https://hub.docker.com/r/oneamex/one-app-dev
[parrot]: https://github.com/americanexpress/parrot
[one app]: https://github.com/americanexpress/one-app
[one-app-bundler]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler
[dll-plugin]: https://webpack.js.org/plugins/dll-plugin/
[providedexternals--requiredexternals]: https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler#providedexternals--requiredexternals
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
[react dev tools extension]: https://reactjs.org/blog/2019/08/15/new-react-devtools.html
[esbuild-loader]: https://github.com/privatenumber/esbuild-loader
[devtool]: https://webpack.js.org/configuration/devtool/
[unionfs]: https://github.com/streamich/unionfs

# @americanexpress/holocron-dev-server

`@americanexpress/holocron-dev-server` is an **experimental** development server
made for [One App][one app] Holocron modules designed for enabling fast refresh and reloading of assets
while creating web experiences.

⚠️ `holocron-dev-server` is a client-side only development server and **does not** run Holocron modules
as One App would normally. Holocron modules are not loaded into memory on the server, nor does it
server side render (only client side). There are other key differences, and as such, `holocron-dev-server`
does not behave the same as One App server.
If you are looking for a **production-like environment**
to run One App Holocron modules, [`@americanexpress/one-app-runner`][one-app-runner]
would be the right tool of choice. This is because `holocron-dev-server` only
provides a faster developer experience on the **client side only**, without the actual One App server.

## 📖 Table of Contents

- [Features](#-features)
- [Usage](#-usage)
- [API](#%EF%B8%8F-api)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

- Runs One App Holocron modules on an experimental development server
- [Fast refresh][react-refresh] for Holocron modules, React components and styles are all hot loaded in the browser
- Zero-config start up with pre-existing `"one-amex"` configuration in the `package.json`
- Hot reload [parrot][parrot] scenarios and watch for changes
- Hot reload language packs and watch for changes from the local modules
- Combines the remote module if provided with the local module map
  remote module map with the universal map
- Local Holocron modules bundles/externals analyzed and reported using [webpack bundle analyzer][webpack bundle analyzer]

### Differences with One App

- Only works client side
- Does not server side render

#### Server Spec

- [`express`][express] server listening for requests: handling request types for navigation, static assets and [parrot] scenarios, on the same port
- [`webpack`][webpack], [`webpack-dev-middleware`][webpack-dev-middleware] and [`webpack-hot-middleware`](webpack-hot-middleware) load a configuration for fast refresh, added with [`react-refresh`][react-refresh] via `babel` and [`@pmmmwh/react-refresh-webpack-plugin react-refresh`][react-refresh-webpack-plugin] via [webpack]
- virtual [`memfs`][memfs] is synced with [unionfs] to the filesystem, it connects with [webpack] dev serving local and remote static assets quickly from memory

## 🤹‍ Usage

> **Prerequisites**
>
> - [Docker][docker] is required to load One App statics from development environment.
> - [React Dev tools browser extension][react dev tools extension] is needed in your browser for fast refresh to work

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

### **Zero-Config**

`holocron-dev-server` uses existing configurations from `"one-amex"`
to source what modules, externals and other configuration like
`rootModuleName` are used.

The config uses [`one-amex.runner`][one-app-runner] (`modules`, `rootModuleName`, `moduleMapUrl`, `dockerImage`, `envVars`)
and [`one-amex.bundler`][one-app-bundler] (`providedExternals`, `requiredExternals`)
to set up the HMR environment for your Holocron module.

#### Default Values

In the case that certain configuration options are not present in the
Holocron module config, there are default values that are used in its place.

- the root module name (`rootModuleName`) will use the current module if it is not defined.
- the docker image (`dockerImage`) will default to `oneamex/one-app-dev:latest` if not defined.

#### **Parrot Scenarios**

If a `mock/scenarios.js` exists in your module,
the `parrot` scenarios will be watched for changes and updated,
please note that the parrot browser extension will need to be changed to refer
to the port used by the holocron development server.

#### **Language Packs**

The same applies if `locale/*` folder exists in your Holocron module.
When a given locale gets modified, the holocron dev server will notify the client
and will load the language pack into state.
Please note that if default fallback for loading the language pack is `en-US`,
if any issue occurs while trying to load it.

## 🎛️ API

**The API is subject to change**

### `holocron-dev-server`

Command line tool usage.

#### Usage

```bash
npx -p @americanexpress/holocron-dev-server -- holocron-dev-server
```

#### Configuration

##### **`hmr` Options**

Use the `one-amex.hmr` config for
more advanced configurations. The experimental `hmr` config is
subject to change. The options supported are:

| name            | type                | required | default        | value                                                                                       |
| --------------- | ------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------- |
| `logLevel`      | `Number or String`         | `false`  | `4` or `"info"`            | `"info"` or `4`, `"log"` or `3`, `"warn"` or `2`, `"error"` or `1`, `0` for silent                  |
| `sourceMap`     | `[Boolean, String]` | `false`  | `"source-map"` | value passed to [webpack]'s [devtool] configuration (eg `inline-cheap-source-map`, `false`) |
| `clientConfig`  | `Object`            | `false`  | `{}`           | the One App configuration in the store (`store.get('config')`)                              |
| `port`          | `Number`            | `false`  | `4000`         | the port that `holocron-dev-server` binds to                                                |
| `openWhenReady` | `Boolean`           | `false`  | `false`        | Set to `true` to enable opening your default browser when ready                             |

```json
{
  "one-amex": {
    "hmr": {
      "logLevel": "info",
      "port": 4000,
      "openWhenReady": false,
      "sourceMap": "inline-cheap-source-map",
      "clientConfig": {
        "myClientSideConfig": "https://url"
      }
    }
  }
}
```

## Troubleshooting

There may be instances where fast refresh may stop working
for various reasons, check out the
[troubleshooting guide from `@pmmmwh/react-refresh-webpack-plugin react-refresh`](react-refresh-troubleshooting)
for debugging tips.

If any issues persist, try removing the `static` directory generated
and run the development server again.
