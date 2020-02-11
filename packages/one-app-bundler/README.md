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
    "prepare": "npm run build",
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
App. These dependencies can be provided to your modules by your tenant root
module. The tenant root module should include in its configuration
`providedExternals`, which is an array of external dependencies to be bundled
with it and provided to other modules.

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
tenant root module to provide by setting the `requiredExternals` option. Any dependency
listed there will not be bundled with the module, but will be replaced with a
reference to the external dependency as provided by the tenant root module.

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
Modules shouldn't configure both `providedExternals` and `requiredExternals`.

Any module with `requiredExternals` configured will be validate at runtime to ensure that
the tenant root module is in fact providing those requiredExternals, and will fail to load if it is
not.

If you attempt to include in `providedExternals` or `requiredExternals` and dependencies
already provided by One App, your build will fail.

#### `performanceBudget`

Set a custom [performance budget](https://webpack.js.org/configuration/performance/#performancemaxassetsize)
for your client module build. The default value is `200e3`.

```json
{
  "one-amex": {
    "bundler": {
      "performanceBudget": 500e3
    }
  }
}
```

#### `webpackConfigPath`

You may extend the webpack configuration by providing a path to your config file
in this option. Use of this option is at your own risk.

```json
{
  "one-amex": {
    "bundler": {
      "webpackConfigPath": "webpack.config.js"
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

### Other Available Scripts

The following scripts are provided by `one-app-bundler` and used by `one-app`.

**`npm run build:bundle`**

This would bundle one app.

**`npm run serve-module ../path-to-your-one-app-module`**

This would serve your module locally.

**`npm run drop-module ../path-to-your-one-app-module`**

This would stop serving your module locally.
