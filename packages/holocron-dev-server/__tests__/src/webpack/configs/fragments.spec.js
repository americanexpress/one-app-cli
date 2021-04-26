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

import {
  DefinePlugin, DllPlugin, DllReferencePlugin, EnvironmentPlugin,
} from 'webpack';
import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import {
  getModulesPath,
  getPublicModulesUrl,
} from '../../../../src/utils/paths';
import {
  createBrowserConfigFragment,
  createDllReferenceConfigFragment,
  createDllBundleConfigFragment,
  createHolocronModulesConfigFragment,
  createBundleAnalyzerConfigFragment,
  createEnvironmentDefinitionsConfigFragment,
  createResolverConfigFragment,
  createWatchOptionsConfigFragment,
} from '../../../../src/webpack/configs/fragments';
import { getWebpackVersion } from '../../../../src/webpack/helpers';

jest.mock('../../../../src/webpack/helpers', () => {
  const originalModule = jest.requireActual('../../../../src/webpack/helpers');

  return {
    ...originalModule,
    getWebpackVersion: jest.fn(() => 5),
  };
});
const { NODE_ENV } = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = NODE_ENV;
});
describe('createDllReferenceConfigFragment', () => {
  test('returns development config for main externals build', () => {
    const fragment = createDllReferenceConfigFragment();
    expect(fragment).toEqual({
      plugins: [
        new DllReferencePlugin({
          context: process.cwd(),
          manifest: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
          name: '__externals__',
        }),
      ],
    });
  });
});
describe('createBrowserConfigFragment', () => {
  test('that source map is returned in development', () => {
    process.env.NODE_ENV = 'development';
    const fragment = createBrowserConfigFragment();
    expect(fragment).toEqual({
      devtool: 'eval-cheap-source-map',
      mode: 'development',
      target: 'web',
    });
  });
});
describe('createDllBundleConfigFragment', () => {
  test('returns development config fragment for main externals build', () => {
    const fragment = createDllBundleConfigFragment();
    expect(fragment.plugins[0]).toEqual(
      new DllPlugin({
        context: process.cwd(),
        name: '__externals__',
        path: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
      })
    );
  });
});
describe('createHolocronModulesConfigFragment', () => {
  test('returns holocron modules config fragment', () => {
    const fragment = createHolocronModulesConfigFragment();
    expect(fragment).toEqual(
      {
        entry: {},
        externals: {
          '@americanexpress/one-app-ducks': {
            commonjs2: '@americanexpress/one-app-ducks',
            root: 'OneAppDucks',
            var: 'OneAppDucks',
          },
          '@americanexpress/one-app-router': {
            commonjs2: '@americanexpress/one-app-router',
            root: 'OneAppRouter',
            var: 'OneAppRouter',
          },
          'create-shared-react-context': {
            commonjs2: 'create-shared-react-context',
            root: 'CreateSharedReactContext',
            var: 'CreateSharedReactContext',
          },
          holocron: {
            commonjs2: 'holocron',
            root: 'Holocron',
            var: 'Holocron',
          },
          'holocron-module-route': {
            commonjs2: 'holocron-module-route',
            root: 'HolocronModuleRoute',
            var: 'HolocronModuleRoute',
          },
          immutable: {
            commonjs2: 'immutable',
            root: 'Immutable',
            var: 'Immutable',
          },
          'prop-types': {
            commonjs2: 'prop-types',
            root: 'PropTypes',
            var: 'PropTypes',
          },
          react: {
            commonjs2: 'react',
            root: 'React',
            var: 'React',
          },
          'react-dom': {
            commonjs2: 'react-dom',
            root: 'ReactDOM',
            var: 'ReactDOM',
          },
          'react-helmet': {
            commonjs2: 'react-helmet',
            root: 'ReactHelmet',
            var: 'ReactHelmet',
          },
          'react-redux': {
            commonjs2: 'react-redux',
            root: 'ReactRedux',
            var: 'ReactRedux',
          },
          redux: {
            commonjs2: 'redux',
            root: 'Redux',
            var: 'Redux',
          },
          reselect: {
            commonjs2: 'reselect',
            root: 'Reselect',
            var: 'Reselect',
          },
        },
        optimization: {
          runtimeChunk: 'single',
        },
        output: {
          filename: '[name]/[name].js',
          path: getModulesPath(),
          publicPath: getPublicModulesUrl(),
          uniqueName: '__holocron_modules__',
        },
        plugins: [
          {
            options: {},
          },
        ],
      }
    );
  });
  test('returns holocron modules config fragment with hot module reload', () => {
    getWebpackVersion.mockImplementationOnce(() => 4);
    const fragment = createHolocronModulesConfigFragment({ hot: true });
    expect(fragment.plugins[0]).toEqual(
      {
        options: {
          hot: true,
        },
      }
    );
  });
});
describe('createBundleAnalyzerConfigFragment', () => {
  test('returns development config fragment for bundle analyzer', () => {
    expect(createBundleAnalyzerConfigFragment()).toEqual(
      {
        plugins: [
          new BundleAnalyzerPlugin({
            openAnalyzer: false,
            generateStatsFile: false,
            logLevel: 'silent',
            analyzerMode: 'static',
            reportFilename: './development-environment-holocron-modules-report.html',
          }),
        ],
      }
    );
  });
});

describe('createEnvironmentDefinitionsConfigFragment', () => {
  test('returns development config fragment for environment definitions fragment', () => {
    process.env.NODE_ENV = 'development';
    expect(createEnvironmentDefinitionsConfigFragment()).toEqual(
      {
        plugins: [
          new EnvironmentPlugin({
            NODE_ENV: 'development',
          }),
          new DefinePlugin({
            'global.BROWSER': 'true',
          }),
        ],
      }
    );
  });
  test('returns production config fragment for environment definitions fragment', () => {
    process.env.NODE_ENV = 'production';
    expect(createEnvironmentDefinitionsConfigFragment()).toEqual(
      {
        plugins: [
          new EnvironmentPlugin({
            NODE_ENV: 'production',
          }),
          new DefinePlugin({
            'global.BROWSER': 'true',
          }),
        ],
      }
    );
  });
});
describe('createResolverConfigFragment', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => '/path');
  jest.spyOn(path, 'relative').mockImplementation(() => '/relative/path');

  test('returns config fragment for resolver', () => {
    const fragment = createResolverConfigFragment({
      modules: [{
        modulePath: 'module/path',
      },
      ],
    });
    expect(fragment.resolve)
      .toEqual({
        alias: {},
        extensions: [
          '.js',
          '.jsx',
        ],
        mainFields: [
          'module',
          'browser',
          'main',
        ],
        modules: [
          'node_modules',
          '/relative/path',
          '/path/module/path/src',
          '/path/module/path/node_modules',
        ],
      }
      );
  });
});
describe('createWatchOptionsConfigFragment', () => {
  test('returns config fragment for watch options', () => {
    const fragment = createWatchOptionsConfigFragment();
    expect(fragment)
      .toEqual({
        watchOptions: {
          aggregateTimeout: 200,
          ignored: '**/node_modules',
        },
      });
  });
});
