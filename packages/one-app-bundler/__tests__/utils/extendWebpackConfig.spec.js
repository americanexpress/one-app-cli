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
import webpack from 'webpack';
import HolocronModuleRegisterPlugin from 'holocron-module-register-webpack-plugin';

import extendWebpackConfig from '../../utils/extendWebpackConfig.js';
import getConfigOptions from '../../utils/getConfigOptions.js';
import getCliOptions from '../../utils/getCliOptions.js';

const mockOverridingHolocronModuleRegisterPlugin = () => new HolocronModuleRegisterPlugin('my-new-holocron-module');
const mockOverridingWebpackDefinePlugin = () => new webpack.DefinePlugin({ 'global.BROWSER': JSON.stringify(true) });

jest.mock('read-package-up', () => () => ({
  readPackageUpSync: jest.fn(() => ({ pkg: { name: 'test-module', version: '1.0.0' } })),
}));

jest.mock('/path/webpack.config.js', () => ({
  module: {
    rules: [
      { test: /\.js$/, use: 'my-super-cool-loader' },
    ],
  },
}), { virtual: true });

jest.mock('/path/webpack.client.config.js', () => ({
  module: {
    rules: [
      { test: /\.js$/, use: 'my-super-cool-client-loader' },
    ],
  },
  plugins: [mockOverridingHolocronModuleRegisterPlugin()],
}), { virtual: true });

jest.mock('/path/webpack.server.config.js', () => ({
  module: {
    rules: [
      { test: /\.js$/, use: 'my-super-cool-server-loader' },
    ],
  },
  plugins: [mockOverridingWebpackDefinePlugin()],
}), { virtual: true });

jest.mock('../../utils/getConfigOptions', () => jest.fn(() => ({})));
jest.mock('../../utils/getCliOptions', () => jest.fn(() => ({})));

jest.mock('../../utils/getMetaUrl.mjs', () => () => 'metaUrlMock');

jest.mock('node:url', () => ({
  fileURLToPath: jest.fn(() => __dirname),
}));

describe('extendWebpackConfig', () => {
  let originalWebpackConfig = {};

  jest.spyOn(process, 'cwd').mockImplementation(() => '/path');

  const originalPlatform = process.platform;

  beforeEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    jest.clearAllMocks();
    originalWebpackConfig = {
      resolve: {
        mainFields: ['browser', 'module', 'main'],
        modules: ['.', 'node_modules'],
        extensions: ['.js', '.jsx'],
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            include: ['src', 'node_modules'],
            use: ['babel-loader'],
          },
        ],
      },
      plugins: [new HolocronModuleRegisterPlugin('default-holocron-module')],
    };
  });

  it('should apply webpack config', async () => {
    expect.assertions(2);
    getConfigOptions.mockReturnValueOnce({ webpackConfigPath: 'webpack.config.js' });

    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;
    const lastRule = rules[rules.length - 1];
    expect(rules.length).toBe(originalWebpackConfig.module.rules.length + 1);
    expect(lastRule.use).toBe('my-super-cool-loader');
  });

  it('should apply a client webpack config', async () => {
    expect.assertions(4);
    getConfigOptions.mockReturnValueOnce({ webpackClientConfigPath: 'webpack.client.config.js' });
    const result = await extendWebpackConfig(originalWebpackConfig, 'client');
    const { plugins } = result;
    const { rules } = result.module;
    const lastRule = rules[rules.length - 1];
    expect(rules.length).toBe(originalWebpackConfig.module.rules.length + 1);
    expect(lastRule.use).toBe('my-super-cool-client-loader');
    expect(plugins.length).toBe(1);
    expect(plugins[0].moduleName).toBe('my-new-holocron-module');
  });

  it('should apply a server webpack config', async () => {
    expect.assertions(4);
    const serverWebpackConfig = {
      ...originalWebpackConfig,
      plugins: [],
    };
    getConfigOptions.mockReturnValueOnce({ webpackServerConfigPath: 'webpack.server.config.js' });
    const result = await extendWebpackConfig(serverWebpackConfig, 'server');
    const { plugins } = result;
    const { rules } = result.module;
    const lastRule = rules[rules.length - 1];
    expect(rules.length).toBe(serverWebpackConfig.module.rules.length + 1);
    expect(lastRule.use).toBe('my-super-cool-server-loader');
    expect(plugins.length).toBe(1);
    expect(plugins[0].definitions).toEqual({
      'global.BROWSER': 'true',
    });
  });

  describe('merging plugins', () => {
    it('should add a plugin if there is none in the original webpack configuration', async () => {
      expect.assertions(2);
      const originalConfigWithNoPlugins = {
        ...originalWebpackConfig,
        plugins: [],
      };
      getConfigOptions.mockReturnValueOnce({ webpackClientConfigPath: 'webpack.client.config.js' });
      const result = await extendWebpackConfig(originalConfigWithNoPlugins, 'client');
      const { plugins } = result;
      expect(plugins.length).toBe(1);
      expect(plugins[0].moduleName).toBe('my-new-holocron-module');
    });

    it('should add a new plugin if the original webpack configuration does not have it', async () => {
      expect.assertions(3);
      const originalConfigWithNoPlugins = {
        ...originalWebpackConfig,
        plugins: [mockOverridingWebpackDefinePlugin()],
      };
      getConfigOptions.mockReturnValueOnce({ webpackClientConfigPath: 'webpack.client.config.js' });
      const result = await extendWebpackConfig(originalConfigWithNoPlugins, 'client');
      const { plugins } = result;
      expect(plugins.length).toBe(2);
      expect(plugins[0].moduleName).toBe('my-new-holocron-module');
      expect(plugins[1].definitions).toEqual({
        'global.BROWSER': 'true',
      });
    });

    it('should replace an existing plugin if the same name is in the original webpack configuration', async () => {
      expect.assertions(2);
      getConfigOptions.mockReturnValueOnce({ webpackClientConfigPath: 'webpack.client.config.js' });
      const result = await extendWebpackConfig(originalWebpackConfig, 'client');
      const { plugins } = result;
      expect(plugins.length).toBe(1);
      expect(plugins[0].moduleName).toBe('my-new-holocron-module');
    });
  });

  it('should bundle requiredExternals designated by providedExternals', async () => {
    expect.assertions(2);
    getConfigOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'chalk', 'lodash'], moduleName: 'test-root-module' });
    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;
    expect(rules).toHaveLength(originalWebpackConfig.module.rules.length + 1);
    expect(rules[rules.length - 1]).toMatchSnapshot();
  });

  it('should bundle requiredExternals designated by providedExternals with custom configuration', async () => {
    expect.assertions(2);
    getConfigOptions.mockReturnValueOnce({
      providedExternals: {
        ajv: {
          enableFallback: true,
        },
        chalk: {
          enableFallback: false,
        },
        lodash: {},
      },
      moduleName: 'test-root-module',
    });
    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;
    expect(rules).toHaveLength(originalWebpackConfig.module.rules.length + 1);
    expect(rules[rules.length - 1]).toMatchSnapshot();
  });

  it('should use the provided requiredExternals configured, resolved to the js file', async () => {
    expect.assertions(4);
    getConfigOptions.mockReturnValueOnce({ requiredExternals: ['ajv', 'lodash'] });
    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;

    expect(rules).toHaveLength(originalWebpackConfig.module.rules.length + 3);
    expect(rules[rules.length - 3]).toMatchSnapshot({
      test: expect.stringMatching(/ajv.js$/),
    });
    expect(rules[rules.length - 2]).toMatchSnapshot({
      test: expect.stringMatching(/lodash.js$/),
    });
    expect(rules[rules.length - 1]).toMatchSnapshot();
  });

  it('should enable missing external fallbacks', async () => {
    expect.assertions(1);
    getConfigOptions.mockReturnValueOnce({ enableUnlistedExternalFallbacks: true });
    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;
    expect(rules[rules.length - 1]).toMatchSnapshot();
  });

  it('should validate the one app version', async () => {
    expect.assertions(1);
    getConfigOptions.mockReturnValueOnce({ appCompatibility: '^4.41.0' });
    const result = await extendWebpackConfig(originalWebpackConfig);
    const { rules } = result.module;
    expect(rules[rules.length - 1]).toMatchSnapshot();
  });

  it('should enable watch mode', async () => {
    expect.assertions(2);
    getCliOptions.mockReturnValueOnce({ watch: true });
    const result = await extendWebpackConfig(originalWebpackConfig);
    expect(result.watch).toBe(true);
    expect(result.watchOptions).toMatchObject({
      aggregateTimeout: 500,
      ignored: /node_modules/,
    });
  });
});
