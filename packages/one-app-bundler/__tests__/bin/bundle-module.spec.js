/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const buildWebpack = require('../../utils/buildWebpack');
const time = require('../../utils/time');

jest.mock('@americanexpress/one-app-locale-bundler', () => jest.fn(() => Promise.resolve()));
jest.mock('../../utils/buildWebpack', () => jest.fn(() => Promise.resolve()));
jest.mock('../../utils/time', () => jest.fn((cb) => Promise.resolve(cb())));
jest.mock('../../webpack/module/webpack.client', () => (babelEnv) => ({ config: 'client', babelEnv }));
jest.mock('../../webpack/module/webpack.server', () => ({ config: 'server' }));

function loadBundleModule() {
  jest.isolateModules(() => {
    require('../../bin/bundle-module');
  });
}

describe('bundle-module', () => {
  let argv;
  let localeBundler;
  let clientConfig;
  let serverConfig;

  beforeAll(() => {
    ({ argv } = process);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localeBundler = require('@americanexpress/one-app-locale-bundler');
    clientConfig = require('../../webpack/module/webpack.client');
    serverConfig = require('../../webpack/module/webpack.server');
  });

  afterEach(() => {
    process.argv = argv;
  });

  it('should bundle language packs', () => {
    process.argv = [];
    loadBundleModule();
    expect(localeBundler).toHaveBeenCalledTimes(1);
    expect(localeBundler).toHaveBeenCalledWith(false);
  });

  it('should bundle the module for the server, browser and legacy', () => {
    process.argv = [];
    loadBundleModule();
    const configs = [
      ['node', serverConfig],
      ['browser', clientConfig('modern')],
      ['legacyBrowser', clientConfig('legacy')],
    ].map(([name, config]) => ({
      ...config,
      name,
    }));
    expect(time).toHaveBeenCalledTimes(2);
    expect(buildWebpack).toHaveBeenCalledWith(configs, { watch: false });
  });

  it('should use the locale bundler\'s watch mode', () => {
    process.argv = ['--watch'];
    loadBundleModule();
    expect(localeBundler).toHaveBeenCalledTimes(1);
    expect(localeBundler).toHaveBeenCalledWith(true);
  });
});
