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

/* eslint-disable global-require --
testing `on import` functionality needs 'require' in every tests */

jest.mock('webpack');
jest.mock('@americanexpress/one-app-locale-bundler');
jest.mock('../../bin/webpackCallback', () => jest.fn((x, y) => `cb(${x}, ${y})`));
jest.mock('../../webpack/module/webpack.client', () => (babelEnv) => ({ config: 'client', babelEnv }));
jest.mock('../../webpack/module/webpack.server', () => ({ config: 'server' }));

const sleep = (ms = 100) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

describe('bundle-module', () => {
  let argv;
  let webpack;
  let localeBundler;
  let clientConfig;
  let serverConfig;

  beforeAll(() => {
    ({ argv } = process);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    webpack = require('webpack');
    localeBundler = require('@americanexpress/one-app-locale-bundler');
    clientConfig = require('../../webpack/module/webpack.client');
    serverConfig = require('../../webpack/module/webpack.server');
    jest.mock('../../utils/getConfigOptions', () => jest.fn(() => ({ disableDevelopmentLegacyBundle: false })));
  });

  afterEach(() => {
    process.argv = argv;
  });

  it('should bundle language packs', () => {
    process.argv = [];
    require('../../bin/webpack-bundle-module');
    expect(localeBundler).toHaveBeenCalledTimes(1);
    expect(localeBundler).toHaveBeenCalledWith(false);
  });

  it('should bundle the module for the server', async () => {
    process.argv = [];
    require('../../bin/webpack-bundle-module');

    await sleep();

    expect(webpack).toHaveBeenCalledTimes(3);
    expect(webpack).toHaveBeenCalledWith(serverConfig, 'cb(node, true)');
    expect(webpack.mock.calls[0][0]).not.toHaveProperty('watch');
    expect(webpack.mock.calls[0][0]).not.toHaveProperty('watchOptions');
  });

  it('should bundle the module for modern browsers', async () => {
    process.argv = [];
    require('../../bin/webpack-bundle-module');

    await sleep();

    expect(webpack).toHaveBeenCalledTimes(3);
    expect(webpack).toHaveBeenCalledWith(clientConfig('modern'), 'cb(browser, true)');
    expect(webpack.mock.calls[1][0]).not.toHaveProperty('watch');
    expect(webpack.mock.calls[1][0]).not.toHaveProperty('watchOptions');
  });

  it('should bundle the module for legacy browsers', async () => {
    process.argv = [];
    require('../../bin/webpack-bundle-module');

    await sleep();

    expect(webpack).toHaveBeenCalledTimes(3);
    expect(webpack).toHaveBeenCalledWith(clientConfig('legacy'), 'cb(legacyBrowser, true)');
    expect(webpack.mock.calls[2][0]).not.toHaveProperty('watch');
    expect(webpack.mock.calls[2][0]).not.toHaveProperty('watchOptions');
  });

  it('should use the locale bundler\'s watch mode', () => {
    process.argv = ['--watch'];
    require('../../bin/webpack-bundle-module');
    expect(localeBundler).toHaveBeenCalledTimes(1);
    expect(localeBundler).toHaveBeenCalledWith(true);
  });

  it('should bundle module for legacy browsers when disableDevelopmentLegacyBundle is false', async () => {
    jest.mock('../../utils/getConfigOptions', () => jest.fn(() => ({ disableDevelopmentLegacyBundle: false })));
    process.argv = [];
    require('../../bin/webpack-bundle-module');

    await sleep();

    expect(webpack).toHaveBeenCalledTimes(3);
    expect(webpack).toHaveBeenCalledWith(clientConfig('legacy'), 'cb(legacyBrowser, true)');
  });

  it('should not bundle module for legacy browsers when disableDevelopmentLegacyBundle is true', async () => {
    process.env.NODE_ENV = 'development';
    jest.mock('../../utils/getConfigOptions', () => jest.fn(() => ({ disableDevelopmentLegacyBundle: true })));
    process.argv = [];
    require('../../bin/webpack-bundle-module');

    await sleep();

    expect(webpack).toHaveBeenCalledTimes(2);
    expect(webpack).not.toHaveBeenCalledWith(clientConfig('legacy'), 'cb(legacyBrowser, true)');
  });
});

/* eslint-enable global-require -- disables require enables */
