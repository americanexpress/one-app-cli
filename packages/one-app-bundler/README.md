# @americanexpress/one-app-bundler

[![npm](https://img.shields.io/npm/v/@americanexpress/one-app-bundler)](https://www.npmjs.com/package/@americanexpress/one-app-bundler)

> A command line interface(CLI) tool for bundling [One App](https://github.com/americanexpress/one-app)
and One App modules.

## 🤹‍ Usage

### To bundle a One App module

To build a React component for usage as a One App module:

Install:

```bash
npm i -D @americanexpress/one-app-bundler
```

Run the `bundle-module` script as part of your build. This script is provided by `one-app-bundler`:

```json
{
  "scripts": {
    "build": "bundle-module",
    "prepare": "npm run build"
  }
}
```

When bundling a One App module, some options can be applied by adding a `bundler` config object to a `one-amex` section
within `package.json`:

```json
{
  "one-amex": {
    "bundler": {
    }
  }
}
```

#### `providedExternals` & `requiredExternals`

In order to avoid duplicate code in your One App instance, you may want to
share a dependency across all your modules that is not already provided by One
App. These dependencies can be provided to your modules by your root
module. The root module should include in its configuration
`providedExternals`, which is an array of external dependencies to be bundled
with it and provided to other modules.

Modules shouldn't configure both `providedExternals` and `requiredExternals`.
Remember `providedExternals` are dependencies which your root module will make available to child modules. `requiredExternals` are a list of dependencies the child module will need to be made available by the root module.

All modules `requiredExternals` are validated at runtime against the root modules list of `providedExternals`. If the external dependency is not provided One App will throw an error. This will either result in the One App server not starting or, if it is already running, One App will not load that module. For example, if your child module requires `^2.1.0` of a dependency but your root module provides `2.0.0`, this will result in One App not loading that child module as the provided dependencies version does not satisfy the required semantic range.

This ensures that all of the listed dependencies features potentially required by the child module to work will be provided which could result in hard to debug bugs.

If you attempt to include one of the [dependencies](https://github.com/americanexpress/one-app-cli/blob/main/packages/one-app-bundler/webpack/webpack.common.js#L102-L155) provided by One App in your `providedExternals` or `requiredExternals`, your build will fail.

First make sure to add your dependency to your module's `package.json`:

```bash
npm install some-dependency
```

Then configure `one-app-bundler` to provide that dependency (and any others) as an external to your other modules:

```json
{
  "one-amex": {
    "bundler": {
      "providedExternals": ["some-dependency", "another-dependency"]
    }
  }
}
```

Modules consuming these external dependencies must declare what they expect the
root module to provide by setting the `requiredExternals` option. Any dependency
listed there will not be bundled with the module, but will be replaced with a
reference to the external dependency as provided by the root module.

Before doing so make sure to add said dependency to your `package.json`:

```bash
npm install some-dependency
```

```json
{
  "one-amex": {
    "bundler": {
      "requiredExternals": ["some-dependency"]
    }
  }
}
```

##### Pros and Cons of Externals

**Pros:**

* Smaller module bundle size
* Can allow for centralized updates
* Easy security patches providing child module sem ver range permits

**Cons:**

* Lose treeshaking potentially causing larger bundle sizes
  * For example, adding something like lodash as an external when only a small part of the library is used could result in the client having to download more than if the tree shaken versions were bundled with the module.
* Couples your child and root module together
* Increases complexity when managing updates to the provided and required dependency

#### `performanceBudget`

Set a custom [performance budget](https://webpack.js.org/configuration/performance/#performancemaxassetsize)
for your client module build. The default value is `250e3` (244kB).

```json
{
  "one-amex": {
    "bundler": {
      "performanceBudget": 500e3
    }
  }
}
```

#### `webpackConfigPath, webpackClientConfigPath, & webpackServerConfigPath`

You may extend the webpack configuration by providing paths to custom webpack config files
in this option. Use of this option is at your own risk.

There are two options when customizing your webpack build.

1. Add `webpackConfigPath` to apply a custom config to both your client and server builds.

```json
{
  "one-amex": {
    "bundler": {
      "webpackConfigPath": "webpack.config.js"
    }
  }
}
```

2. Add `webpackClientConfigPath` and/or `webpackServerConfigPath` to apply different configs 
to your client and server builds. You don't need to add both of these options. 
You can pass only one if you wish to customize a single build target.

```json
{
  "one-amex": {
    "bundler": {
      "webpackClientConfigPath": "webpack.client.config.js",
      "webpackServerConfigPath": "webpack.server.config.js"
    }
  }
}
```

#### [`purgecss`](https://github.com/FullHuman/purgecss) Options

You may add additional paths for `purgecss` to consider before stripping out
unused CSS by adding an array of glob patterns to `bundler.purgecss.paths`
under `bundler.purgecss.paths`. The example below illustrates how we would add
`some-lib` if we were applying custom styles to it in our module.

```json
{
  "one-amex": {
    "bundler": {
      "purgecss": {
        "paths": ["node_modules/some-lib/src/**/*.{js,jsx}"]
      }
    }
  }
}
```

Additional `purgecss` options. Please refer to the [`purgecss Options Documentation`](https://github.com/FullHuman/purgecss)
before enabling any of the following:

```json
{
  "one-amex": {
    "bundler": {
      "purgecss": {
        "paths": ["node_modules/some-lib/src/**/*.{js,jsx}"],
        "extractors": [{
          "extractor": "purgeJs",
          "extensions": [
            "js"
          ]
        }],
        "fontFace": false,
        "keyframes": false,
        "variables": false,
        "whitelist": [
          "random",
          "yep",
          "button"
        ],
        "whitelistPatterns": ["red"],
        "whitelistPatternsChildren": ["blue"]
      }
    }
  }
}
```

`purgecss` can be disabled for your module by adding
`bundler.purgecss.disabled` as `true`. **This option is only to be used in
rare instances and as a last resort, the effect of _disabling will have a
negative impact on performance_.**

```json
{
  "one-amex": {
    "bundler": {
      "purgecss": {
        "disabled": true
      }
    }
  }
}
```

#### Specify what version of One App your module is compatible with

You can specify which version of One App you module is compatible with by simply adding the below configuration to your `package.json`.

```json
{
  "one-amex": {
    "app": {
      "compatibility": "^5.0.0"
    },
  }
}
```

### Other Available Scripts

The following scripts are provided by `one-app-bundler` and used by `one-app`.

**`npm run build:bundle`**

This would bundle one app.

**`npm run serve-module ../path-to-your-one-app-module`**

This would serve your module locally.

**`npm run drop-module ../path-to-your-one-app-module`**

This would stop serving your module locally.
