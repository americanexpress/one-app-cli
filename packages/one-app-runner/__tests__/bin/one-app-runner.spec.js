/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

const path = require('node:path');
const startApp = require('../../src/startApp');
const objectToFlags = require('../../utils/objectToFlags');
const pkg = require('../../package.json');

const originalProcessArgv = process.argv;
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(process, 'exit').mockImplementation(() => {});
jest.mock('../../src/startApp', () => jest.fn(() => Promise.resolve()));

// eslint-disable-next-line global-require -- testing `on import` behavior
const reloadRunner = async () => jest.isolateModules(async () => require('../../bin/one-app-runner'));

const setArgv = (argv) => {
  process.argv = ['node', 'node_modules/.bin/one-app-runner', ...objectToFlags(argv)];
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.unmock('../../../../package.json');
  process.argv = originalProcessArgv;
});

afterAll(() => {
  process.argv = originalProcessArgv;
});

test('command errors out if --module-map-url option is not given a value', async () => {
  setArgv({ moduleMapUrl: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --module-map-url option must be given a value but was not given one. Did you mean to pass a value? ⚠️"');
});

test('command errors out if --root-module-name option is not given a value', async () => {
  setArgv({ rootModuleName: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --root-module-name option must be given a value but was not given one. Did you mean to pass a value? ⚠️"');
});

test('command errors out if --root-module-name option is not given', async () => {
  setArgv({ moduleMapUrl: 'https://example.com/module-map.json', dockerImage: 'one-app:5.0.0' });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"Missing required argument: root-module-name"');
});

test('command errors out if --docker-image option is not given a value', async () => {
  setArgv({ dockerImage: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --docker-image option must be given a value but was not given one. Did you mean to pass a value? ⚠️"');
});

test('command errors out if --docker-image option is not given', async () => {
  setArgv({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root' });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"Missing required argument: docker-image"');
});

test('command errors out if --include-jaeger is given when loading an older version of One App', async () => {
  setArgv({
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
    includeJaeger: true,
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --include-jaeger option requires a One App version >=6.11.0. ⚠️"');
});

test('command does not error if --include-jaeger is given when loading 6.11.0 of One App or newer', async () => {
  setArgv({
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:6.11.1',
    includeJaeger: true,
  });
  await reloadRunner();
  expect(process.exit).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

test('command does not error if --include-jaeger is given when loading latest of One App', async () => {
  setArgv({
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:latest',
    includeJaeger: true,
  });
  await reloadRunner();
  expect(process.exit).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

test('--parrot-middleware, --modules, --output-file, and --dev-endpoints values are coerced into absolute paths', async () => {
  setArgv({
    modules: '../fake/path/to/fake-module',
    parrotMiddleware: '../fake/path/to/fake-module/dev.middleware.js',
    outputFile: '../fake/path/to/fake-module/one-app.log',
    devEndpoints: '../fake/path/to/fake-module/dev.endpoints.js',
  });

  await reloadRunner();

  expect(
    path.isAbsolute(startApp.mock.calls[0][0].parrotMiddlewareFile)
  ).toBeTruthy();
  expect(
    path.isAbsolute(startApp.mock.calls[0][0].devEndpointsFile)
  ).toBeTruthy();
  expect(
    path.isAbsolute(startApp.mock.calls[0][0].modulesToServe[0])
  ).toBeTruthy();
});

test('command errors out if --dev-endpoints is not given a value', async () => {
  setArgv({ devEndpoints: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --dev-endpoints option must be given a value but was not given one. Did you mean to pass a value? ⚠️"');
});

test('reads modules from package.json', async () => {
  const mockModulePath = path.resolve('/fake/path/to/fake-module');
  jest.mock('../../../../package.json', () => ({
    'one-amex': {
      runner: {
        modules: [
          mockModulePath,
        ],
      },
    },
  }));

  await reloadRunner();
  expect(startApp.mock.calls[0][0].modulesToServe).toEqual([mockModulePath]);
});

test('command errors out if --modules option is not given any values', async () => {
  setArgv({ modules: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"⚠️   --modules option must be given a value but was not given one. Did you mean to pass a value? ⚠️"');
});

test('--parrot-middleware, --modules values, --output-file, and --dev-endpoints are left alone if already absolute paths', async () => {
  const modules = path.resolve('/fake/path/to/fake-module');
  const parrotMiddleware = path.resolve('/fake/path/to/fake-module/dev.middleware.js');
  const outputFile = path.resolve('/fake/path/to/fake-module/one-app.log');
  const devEndpoints = path.resolve('/fake/path/to/fake-module/dev.endpoints.js');

  setArgv({
    modules, parrotMiddleware, outputFile, devEndpoints,
  });

  await reloadRunner();

  expect(
    startApp.mock.calls[0][0].modulesToServe[0]
  ).toBe(modules);
  expect(
    startApp.mock.calls[0][0].parrotMiddlewareFile
  ).toBe(parrotMiddleware);
  expect(
    startApp.mock.calls[0][0].devEndpointsFile
  ).toBe(devEndpoints);
});

test('all options are used if specified', async () => {
  setArgv({
    dockerImage: 'one-app:5.0.0',
    devEndpoints: path.resolve('/fake/path/to/fake-module/dev.endpoints.js'),
    'envVars.MY_ENV_VAR': 'value',
    moduleMapUrl: 'https://example.com/module-map.json',
    modules: path.resolve('/fake/path/to/fake-module'),
    outputFile: path.resolve('/fake/path/to/fake-module/one-app.log'),
    parrotMiddleware: path.resolve('/fake/path/to/fake-module/dev.middleware.js'),
    rootModuleName: 'frank-lloyd-root',
    dockerNetworkToJoin: 'one-test-environment-1234',
    useHost: true,
    offline: true,
    logLevel: 'info',
    logFormat: 'machine',
  });
  await reloadRunner();
  expect(process.exit).not.toHaveBeenCalled();
  expect(startApp.mock.calls).toMatchSnapshot();
});

test('command errors out if an unknown option is given', async () => {
  setArgv({
    notAValidOption: true,
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot('"Unknown arguments: not-a-valid-option, notAValidOption"');
});

test('command errors out if an invalid log level is given', async () => {
  setArgv({
    logLevel: 'debug',
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot(`
"Invalid values:
  Argument: log-level, Given: \\"debug\\", Choices: \\"error\\", \\"warn\\", \\"log\\", \\"info\\", \\"trace\\""
`);
});

test('command errors out if log level is not given a value', async () => {
  setArgv({
    logLevel: true,
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot(`
"Invalid values:
  Argument: log-level, Given: \\"\\", Choices: \\"error\\", \\"warn\\", \\"log\\", \\"info\\", \\"trace\\""
`);
});

test('command errors out if an invalid log format is given', async () => {
  setArgv({
    logFormat: 'json',
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot(`
"Invalid values:
  Argument: log-format, Given: \\"json\\", Choices: \\"friendly\\", \\"verbose\\", \\"machine\\""
`);
});

test('command errors out if log format is not given a value', async () => {
  setArgv({
    logFormat: true,
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });

  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toMatchInlineSnapshot(`
"Invalid values:
  Argument: log-format, Given: \\"\\", Choices: \\"friendly\\", \\"verbose\\", \\"machine\\""
`);
});

test('--modules option is required if --module-map-url option is not given', async () => {
  setArgv({ rootModuleName: 'frank-lloyd-root', dockerImage: 'one-app:5.0.0' });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toContain('--no-module-map-url -> modules');
});

test('--modules option is required if --parrot-middleware option is given', async () => {
  setArgv({
    parrotMiddleware: '../path/to/dev.middleware.js',
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toContain('parrot-middleware -> modules');
});

test('--modules option is required if --dev-endpoints option is given', async () => {
  setArgv({
    devEndpoints: '../path/to/dev.endpoints.js',
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:5.0.0',
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toContain('dev-endpoints -> modules');
});

test('--docker-network-to-join is required if --create-docker-network option is given', async () => {
  setArgv({
    rootModuleName: 'frank-lloyd-root',
    moduleMapUrl: 'https://example.com/module-map.json',
    dockerImage: 'one-app:latest',
    createDockerNetwork: true,
  });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(console.error.mock.calls[2][0]).toContain('create-docker-network -> docker-network-to-join');
});

test('an `envVars` key is supported within the config entry', async () => {
  jest.mock('../../../../package.json', () => ({
    'one-amex': {
      runner: {
        envVars: {
          MY_COOL_CONFIG_VARIABLE: 'is-the-best',
        },
      },
    },
  }));

  await reloadRunner();

  expect(startApp.mock.calls[0][0].envVars)
    .toHaveProperty('MY_COOL_CONFIG_VARIABLE', 'is-the-best');
});

test('an `envVars` arg is supported', async () => {
  setArgv({ envVars: '{ "MY_VARIABLE": "my-variable", "HELLO": "WORLD" }' });
  await reloadRunner();
  expect(startApp.mock.calls[0][0].envVars).toMatchObject({
    MY_VARIABLE: 'my-variable',
    HELLO: 'WORLD',
  });
});

test('catches and logs startup errors', async () => {
  setArgv({ rootModuleName: 'frank-lloyd-root', moduleMapUrl: 'https://example.com/module-map.json', dockerImage: 'one-app:6.0.0' });
  startApp.mockImplementationOnce(() => Promise.reject(new Error('💥')));
  await reloadRunner();
  expect(console.error).toHaveBeenCalledWith('⚠️   Error starting up your One App environment: \n', '💥');
});

test('prints help message', async () => {
  setArgv({ help: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(0);
  expect(console.log.mock.calls[0][0]).toMatchSnapshot();
});

test('prints prints the one-app-runner version', async () => {
  setArgv({ version: true });
  await reloadRunner();
  expect(process.exit).toHaveBeenCalledWith(0);
  expect(console.log).toHaveBeenCalledWith(pkg.version);
});
