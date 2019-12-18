# @americanexpress/one-app-locale-bundler

> A command line interface (CLI) tool for bundling a module's locale files for use within the
[One App ecosystem](https://github.com/americanexpress/one-app). This is used internally by
`one-app-bundler` and its `bundle-module` script.

## 📖 Table of Contents

* [Usage](#-usage)

## 🤹‍ Usage

Add files and format them using either options shown below within your one app module.

```
- locale
  - en-US
    - links
      - integration.json
      - qa.json
      - production.json
     copy.json
```

or

```
- locale
  - en-US.json
  - es-ES.json
```

### Installation

```bash
npm i -D @americanexpress/one-app-locale-bundler
```

There are two ways to use this:

### 1. Usage with a build script

Use `bundle-module-locale` in your build script and `one-app-locale-bundler` as a development dependency.

```json
{
  "scripts": {
    "build": "bundle-module-locale"
  },
  "devDependencies": {
    "@americanexpress/one-app-locale-bundler": "^2.3.0"
  }
}
```

### 2. Invocation using a function

The other option is to require `@americanexpress/one-app-locale-bundler` and invoke the function for bundling.

Within the package.json file.

```json
{
  "devDependencies": {
    "@americanexpress/one-app-locale-bundler": "^2.3.0"
  }
}
```

In your JS module.

```js
const localeBundler = require('@americanexpress/one-app-locale-bundler');

localeBundler();
```

Once the npm script `npm run build` is run or the function is invoked the locales are bundled and added to the build folders below. The json files contain
content for `development`, `qa` and `production` environments.

```
- build
  - 1.0.0
    - en-us
      - module-name.json
      - integration.json
      - qa.json
```
