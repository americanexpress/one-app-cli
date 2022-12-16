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
we need to require generated files to validate their content */

const crypto = require('crypto');
const { validateWebpackConfig } = require('../../../test-utils');
const configGenerator = require('../../../webpack/app/webpack.client');
const getConfigOptions = require('../../../utils/getConfigOptions');

jest.mock('../../../webpack/loaders/common', () => {
  const originalModule = jest.requireActual('../../../webpack/loaders/common');

  return {
    ...originalModule,
    sassLoader: jest.fn(() => 'sassLoader'),
  };
});

jest.mock('../../../utils/getConfigOptions', () => jest.fn(() => ({ disableDevelopmentLegacyBundle: false })));

describe('webpack/app', () => {
  let originalNodeEnv;

  jest.spyOn(process, 'cwd').mockImplementation(() => '/');

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should replace md4 with sha256 as default hash algo', () => {
    const mockHash = jest.fn();
    crypto.createHash = mockHash;
    require('../../../webpack/app/webpack.client');
    crypto.createHash('md4');
    expect(mockHash).toHaveBeenCalledWith('sha256');
  });
  it('should keep hash if different than md4', () => {
    const mockHash = jest.fn();
    crypto.createHash = mockHash;
    require('../../../webpack/app/webpack.client');
    crypto.createHash('sha512');
    expect(mockHash).toHaveBeenCalledWith('sha512');
  });

  it('should export valid webpack config', () => {
    const webpackConfig = configGenerator();
    expect(() => validateWebpackConfig(webpackConfig)).not.toThrow();
  });

  it('should put legacy build in a legacy directory', () => {
    const webpackConfig = configGenerator('legacy');
    expect(webpackConfig.output.path).toMatch(/\/build\/app\/tmp\/legacy$/);
  });

  it('should not put modern build in a legacy directory', () => {
    const webpackConfig = configGenerator('modern');
    expect(webpackConfig.output.path).toMatch(/\/build\/app\/tmp$/);
  });

  it('should include a fetch polyfill for legacy browsers', () => {
    const webpackConfig = configGenerator('legacy');
    expect(webpackConfig.entry.vendors.includes('cross-fetch/polyfill')).toBe(true);
  });

  it('should not include a fetch polyfill for modern browsers', () => {
    const webpackConfig = configGenerator('modern');
    expect(webpackConfig.entry.vendors.includes('cross-fetch/polyfill')).toBe(false);
  });

  it('should include abort-controller polyfill for legacy browsers', () => {
    const webpackConfig = configGenerator('legacy');
    expect(webpackConfig.entry.vendors.includes('abort-controller/polyfill')).toBe(true);
  });

  it('should not include abort-controller polyfill for modern browsers', () => {
    const webpackConfig = configGenerator('modern');
    expect(webpackConfig.entry.vendors.includes('abort-controller/polyfill')).toBe(false);
  });

  it('should use more core-js modules for legacy browsers than modern ones', () => {
    const modernWebpackConfig = configGenerator('modern');
    const legacyWebpackConfig = configGenerator('legacy');
    expect(legacyWebpackConfig.entry.vendors.length - modernWebpackConfig.entry.vendors.length)
      .toBeGreaterThan(20);
  });

  it('does not transpile node_modules when DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION true', () => {
    process.env.NODE_ENV = 'development';
    process.env.DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION = 'true';
    const webpackConfig = require('../../../webpack/app/webpack.client')();
    expect(webpackConfig.module.rules[3]).toMatchSnapshot();
  });

  it('transpiles node_modules when DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION false', () => {
    process.env.NODE_ENV = 'development';
    process.env.DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION = 'false';
    const webpackConfig = require('../../../webpack/app/webpack.client')();
    expect(webpackConfig.module.rules[3]).toMatchSnapshot();
  });

  it('always transpiles node_modules when env is production', () => {
    process.env.DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION = 'true';
    process.env.NODE_ENV = 'production';
    const webpackConfig = require('../../../webpack/app/webpack.client')();
    expect(webpackConfig.module.rules[3]).toMatchSnapshot();
  });

  it('should define global.BROWSER to be true', () => {
    const webpackConfig = require('../../../webpack/app/webpack.client')();

    expect(webpackConfig).toHaveProperty('plugins', expect.any(Array));
    expect(webpackConfig.plugins).toContainEqual({ definitions: expect.any(Object) });
    const definitionPlugins = webpackConfig.plugins.filter((plugin) => Object.keys(plugin).includes('definitions'));
    // could have multiple definition sets
    expect(definitionPlugins.length).toBeGreaterThan(0);
    const browserDefinitions = definitionPlugins.filter((plugin) => Object.keys(plugin.definitions).includes('global.BROWSER'));
    // but should only define this once
    expect(browserDefinitions).toHaveProperty('length', 1);
    // stringified, also can't use .toHaveProperty() as the key we need has a dot in it
    expect(browserDefinitions[0].definitions['global.BROWSER']).toBe('true');
  });

  it('should not generate the legacy directory if disableDevelopmentLegacyBundle is true', () => {
    process.env.NODE_ENV = 'development';
    getConfigOptions.mockReturnValueOnce({ disableDevelopmentLegacyBundle: true });
    const legacyWebpackConfig = configGenerator('legacy');
    expect(legacyWebpackConfig.output.path).not.toContainEqual(/\/build\/app\/tmp\/legacy$/);
    const modernWebpackConfig = configGenerator('modern');
    expect(modernWebpackConfig.output.path).toMatch(/\/build\/app\/tmp$/);
  });
});

/* eslint-enable global-require -- disables require enables */
