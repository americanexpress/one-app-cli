# @americanexpress/one-app-hmr

`one-app-hmr` is a development server made for One App Holocron modules.
The library uses `webpack` with hot module reload to hydrate modules,
updates language packs and `parrot` scenarios when changed.
It works well with monorepos and individual Holocron module projects.

The library is geared for quick UI prototyping and collaboration
between design and tech. If you are looking for a production-like
environment to run your Holocron module, `@americanexpress/one-app-runner`
would be the right tool to choose.

## Quick Start:


install:

```bash
npm i -D @americanexpress/one-app-hmr
```

### Using the CLI

The CLI preloads configuration from  your modules and starts watching them for changes,
while updating the browser.

add the script in the `package.json` of your module:

```json
{
  "scripts": {
    "hmr": "one-app-hmr"
  }
}
```

then run:

```bash
npm run hmr
```

### Using Node API

The Node API gives developers the blocks that make up the hot Holocron module server.

```js
import { hmrServer } from '@americanexpress/one-app-hmr';

(async function start() {
  const [app, server] = await hmrServer({
    port: 3090,
    modules: [
      '.',
      '../my-other-module',
    ],
  });
}());
```

### On Prompt

Once `webpack` has completed the build and has been logged, navigate to `http://localhost:4000`.

## Configuration

> A CLI will be coming at a later date to fully configure the HMR experience.

`one-app-hmr` uses pre-existing config so should start with zero-config needed for the server to start.
The config is based on `one-amex.runner` (`modules`, `rootModuleName`, `moduleMapUrl`, `dockerImage`)
and `one-amex.bundler` (`providedExternals`, `requiredExternals`) to set up the HMR environment for your
Holocron module.

If a `mock/scenarios.js` exists in your module, the `parrot` scenarios will be watched for changes and updated.
The same applies if `locale/*` folder exists in your Holocron module. When a given locale is modified, the dev
server will notify the client and will load the language pack into state.

## Troubleshooting

What if the hot module reloading stopped working? The first thing to
try is refreshing the page and see if new changes are reflected.
If the problem persists, try removing the `static` directory.
This would trigger `one-app-hmr` to rebuild the dev server assets
when the command is re-run.
