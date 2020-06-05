[👈 Return to Overview](../README.md)

# Bundling

Within [One App](https://github.com/americanexpress/one-app) you can bundle your modules once you've made changes to them. The bundled files are then loaded on the client and server.

## Bundling Modules

Generate your module using [generator-one-app-module](https://github.com/americanexpress/one-app-cli/tree/master/packages/generator-one-app-module).

The module will have the following folder structure. Ensure it follows the pattern below for the build files to be generated correctly:


Module:
```
module
├── README.md
├── package.json
└── src
    ├── components
    │    └── <NameOfComponent.jsx>
    └── index.js
```

> If doing local development ensure that you've set the `process.env.NODE_ENV` to development using the below script by default webpack set its to production automatically.Please refer to [webpack mode](https://webpack.js.org/?configuration/mode/) for more information.

 ``` sh
 export NODE_ENV=development
 ```

When the [build commands `npm run build`](#build-commands) is executed on the above root folder the following files are generated within the module. The root folder of the build would be the version number provided within the package.json.

Module:
```
module
├── README.md
├── package.json
├── src
|   ├── components
|   |    └── <NameOfComponent.jsx>
|   └── index.js
└── build
    └── <semantic-version-number>
         ├── <module-name>.browser.js
         ├── <module-name>.browser.js.map
         ├── <module-name>.legacy.browser.js
         ├── <module-name>.legacy.browser.js.map
         ├── <module-name>.node.js
         └── <module-name>.node.js.map
```

### Generated files

| File Name       | Description                                                                                    |
|---------------|------------------------------------------------------------------------------------------------|
| `<module-name>.browser.js `| This build is loaded on modern browsers. We use [babel-preset-amex](https://github.com/americanexpress/babel-preset-amex) to determine which modern browsers are supported. Generated using [one-app-bundler](https://github.com/americanexpress/one-app-cli/tree/master/packages/one-app-bundler) which uses [webpack](https://webpack.js.org/) under the hood. |
| `<module-name>.browser.js.map` | Contains the [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) which has details about the origin source code. This is loaded on modern browsers to aid in debugging and it is only generated when the `process.env.NODE_ENV` is set to `development`.|
| `<module-name>.legacy.browser.js` | This build is loaded on legacy browsers. We use [babel-preset-amex](https://github.com/americanexpress/babel-preset-amex) to determine which legacy browsers are supported. Generated using [one-app-bundler](https://github.com/americanexpress/one-app-cli/tree/master/packages/one-app-bundler) which uses [webpack](https://webpack.js.org/) under the hood.|
| `<module-name>.legacy.browser.js.map` | Contains the [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) which has details about the origin source code. This is loaded on legacy browsers to aid in debugging. It is only generated when the `process.env.NODE_ENV` is set to `development`.|
| `<module-name>.node.js` | This build is loaded on `one-app`. Anything set to be server side rendered would executed once this file is loaded on one-app. |
| `<module-name>.node.js.map` | Contains the [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)  which has details about the origin source code. This allows you to debug code running on one-app. This is only generated when the `process.env.NODE_ENV` is set to `development`. |

### Bundler options

Checkout [one-app-bundler](../../one-app-bundler/README.md) for the different options that can be provided to the bundler when bundling your modules.

### CLI Commands

`one-app` modules include [NPM Script Commands](https://docs.npmjs.com/misc/scripts) that are used to bundle and test the module. These scripts are provided from generating a module with [generator-one-app-module](https://github.com/americanexpress/one-app-cli/tree/master/packages/generator-one-app-module) and can be expanded on depending on the functionality that is needed.

```sh
npm run <one-app-module-npm-command> 
# e.g. npm run build
```

We describe each command and a description of its usage below. 

**Contents**

* Build Commands
  * [`prepare`](#build-commands)
  * [`prebuild`](#build-commands)
  * [`build`](#build-commands)
  * [`watch:build`](#build-commands)
* Clean Commands
  * [`clean`](#clean-commands)
* Lint Commands
  * [`lint`](#lint-commands)
  
## Build Commands

| Command       | Description                                                                                    |
|---------------|------------------------------------------------------------------------------------------------|
| `prepare` | Runs `build` before the the module is packed and published. |
| `prebuild` | Cleans the build directory before a build is done. |
| `build` | Builds the `one-app` module.|
| `watch:build` | Builds the `one-app` modules and watches source files & language packs. When source changes, the `one-app` module is rebuilt. |

### `build` Usage

```sh
npm run watch:build
# e.g. npm run watch:build

```

## Clean Commands

| Command       | Description                                                                                    |
|---------------|------------------------------------------------------------------------------------------------|
| `clean`  | Removes folders and files related to [Babel] and [Webpack] builds. |

## Lint Commands

| Command       | Description                                                                                    |
|---------------|------------------------------------------------------------------------------------------------|
| `lint` | Runs [ESLint] [rules](https://github.com/americanexpress/eslint-config-amex) against source. |

## Bundling Locales

 > Looking for internationalization please refer to this resources [Internationalization](../api/modules/Internationalization.md)

Use [one-app-locale-bundler](https://github.com/americanexpress/one-app-cli/tree/master/packages/one-app-locale-bundler#readme) to generate locale files for modules.

Ensure that the locales that you add follow either of the below folder structures before generating them:

* [Locale based](https://github.com/americanexpress/one-app/blob/master/docs/api/modules/Internationalization.md#locale-structure)
* [Environmental specific](https://github.com/americanexpress/one-app/blob/master/docs/api/modules/Internationalization.md#environment-specific-data)

Once the one-app module is created using [generator-one-app-module](https://github.com/americanexpress/one-app-cli/tree/master/packages/generator-one-app-module) within the `package.json` the `bundle-module` script is available.
This script is provided via [one-app-bundler](https://github.com/americanexpress/one-app-cli/tree/master/packages/one-app-bundler) and generates the locales for the modules.


[☝️ Return To Top](#bundling-modules)
