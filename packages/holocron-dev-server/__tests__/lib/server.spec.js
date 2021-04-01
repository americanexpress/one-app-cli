/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import holocronDevServer, { onLaunch } from '../../src/server';
import { openBrowser } from '../../src/utils';
import {
  loadWebpackMiddleware,
  createRenderingMiddleware,
  createModulesProxyRelayMiddleware,
  createMocksMiddleware,
  requestAcceptedMiddleware,
} from '../../src/middleware';
import {
  setLogLevel,
  logHotReloadReady,
  logServerUrl,
  logExternalsBundleAnalyzerUrl,
  logModuleBundlerAnalyzerUrl,
  logServerStart,
} from '../../src/utils/logs';
import { errorReportingUrlFragment } from '../../src/constants';

jest.mock('../../src/utils/logs');
jest.mock('../../src/utils', () => ({
  openBrowser: jest.fn(),
  loadLanguagePacks: jest.fn(),
  getStaticPath: jest.fn(),
  getPublicUrl: jest.fn(),
  loadStatics: jest.fn(),
  createModuleMap: async () => ({
    moduleMap: 'module-map.json',
    localModuleMap: '../sample-module/module-map.json',
    remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
  }),
}));
jest.mock('../../src/middleware', () => ({
  loadWebpackMiddleware: jest.fn(() => ['webpackDevMiddleware', 'webpackHotMiddleware']),
  createRenderingMiddleware: jest.fn(() => 'createRenderingMiddleware'),
  createModulesProxyRelayMiddleware: jest.fn(() => 'createModulesProxyRelayMiddleware'),
  createMocksMiddleware: jest.fn(() => 'createMocksMiddleware'),
  requestAcceptedMiddleware: 'requestAcceptedMiddleware',
}));

jest.mock('express', () => {
  const app = {
    get: jest.fn(() => app),
    post: jest.fn(() => app),
    use: jest.fn(() => app),
    listen: jest.fn((listenArgs, onListeningFn) => {
      process.nextTick(onListeningFn);
    }),
  };
  const mockedExpress = jest.fn(() => app);
  mockedExpress.static = jest.fn(() => 'MOCK_EXPRESS_STATIC');
  return mockedExpress;
});

describe('onLaunch', () => {
  test('returns a callback that logs when the server is up', () => {
    expect(onLaunch({})).toBeInstanceOf(Function);
    expect(() => onLaunch({})('error')).toThrow('error');
    expect(() => onLaunch({ port: 4000, serverAddress: 'http://link.some.where' })()).not.toThrow();
    expect(logHotReloadReady).toHaveBeenCalled();
    expect(logServerUrl).toHaveBeenCalled();
    expect(logModuleBundlerAnalyzerUrl).toHaveBeenCalled();
    expect(logExternalsBundleAnalyzerUrl).not.toHaveBeenCalled();
  });

  test('logs externals bundle stats when provided', () => {
    const fn = onLaunch({ externals: ['react'] });
    expect(() => fn()).not.toThrow();
    expect(logExternalsBundleAnalyzerUrl).toHaveBeenCalled();
  });

  test('opens the browser when "openWhenReady" is configured to true', () => {
    const fn = onLaunch({
      openWhenReady: true,
      port: 4000,
      serverAddress: 'http://link.some.where',
    });
    expect(() => fn()).not.toThrow();
    expect(openBrowser).toHaveBeenCalled();
  });
});

describe('holocronDevServer', () => {
  it('dev server returns express app with a start method for listening on default port', async () => {
    const config = {
      rootModuleName: 'root-module',
      remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
      modules: ['root-module', 'child-module'],
      externals: [],
    };
    const app = await holocronDevServer(config);
    expect(setLogLevel).toHaveBeenCalled();
    expect(logServerStart).toHaveBeenCalled();

    const [devMiddleware, hotMiddleware] = loadWebpackMiddleware();
    expect(app.use).toHaveBeenCalledWith(devMiddleware);
    expect(app.use).toHaveBeenCalledWith(hotMiddleware);
    expect(app.use).toHaveBeenCalledWith(createModulesProxyRelayMiddleware());
    expect(app.use).toHaveBeenCalledWith(createMocksMiddleware());
    expect(app.get).toHaveBeenCalledWith('*', createRenderingMiddleware());
    expect(app.post).toHaveBeenCalledWith(errorReportingUrlFragment, requestAcceptedMiddleware);

    expect(app.listen).not.toHaveBeenCalled();
    expect(() => app.start()).not.toThrow();
    expect(app.listen).toHaveBeenCalled();
  });
});
