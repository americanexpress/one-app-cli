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

import { DllPlugin, validate } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import {
  createExternalsDllWebpackConfig,
  createHolocronModuleWebpackConfig,
} from '../../../../src/webpack/configs';

const { NODE_ENV } = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = NODE_ENV;
});

jest.mock('/path/webpack.config.js', () => ({
  entry: './app/app.js',
  output: {
    filename: 'app.min.js',
    path: './public/static/',
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css?modules&localIdentName=[name]---[local]---[hash:base64:5]'],
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
}), { virtual: true });

describe('createExternalsDllWebpackConfig', () => {
  test('returns the Dll webpack config of the externals provided with default parameters', () => {
    process.env.NODE_ENV = 'development';
    const config = createExternalsDllWebpackConfig();
    expect(config.mode).toEqual('development');
    expect(config.plugins).toEqual([
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
        name: '__externals__',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: './holocron-externals-report.html',
      }),
    ]);
  });
  test('returns the Dll webpack config of the externals provided', () => {
    const config = createExternalsDllWebpackConfig({
      isDev: false,
      entries: ['react'],
    });
    expect(config.mode).toEqual('production');
    expect(config.plugins).toEqual([
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
        name: '__externals__',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: './holocron-externals-report.html',
      }),
    ]);
  });

  test('returns the optimization webpack config for development', () => {
    const config = createExternalsDllWebpackConfig({
      isDev: true,
      dllName: 'vendors',
      entries: ['react'],
    });
    expect(validate(config).length).toEqual(0);
    expect(config.mode).toEqual('development');
    expect(config.plugins).toEqual([
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
        name: '__externals__',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: './holocron-externals-report.html',
      }),
    ]);
  });

  test('returns development config for main externals build', () => {
    const partialConfig = createExternalsDllWebpackConfig({
      dllName: 'vendors',
      useAsReference: true,
    });
    expect(partialConfig.plugins[0]).toEqual(
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/holocron-externals.dll.json`,
        name: '__externals__',
      })
    );
  });
});

describe('createHolocronModuleWebpackConfig', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => '/path');

  test('creates the webpack config for Holocron re-loadable modules', () => {
    const modules = [
      {
        moduleName: 'hot-module',
        modulePath: 'hot-module/src/index.js',
      },
    ];
    const config = createHolocronModuleWebpackConfig({
      modules,
    });
    expect(validate(config).length).toBe(0);
  });

  test('uses Dll config when externals are provided', () => {
    const externals = ['react-package'];
    const config = createHolocronModuleWebpackConfig({
      externals,
    });
    expect(validate(config).length).toBe(1);
    expect(config.externals).toEqual({
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
      holocron: { commonjs2: 'holocron', root: 'Holocron', var: 'Holocron' },
      'holocron-module-route': {
        commonjs2: 'holocron-module-route',
        root: 'HolocronModuleRoute',
        var: 'HolocronModuleRoute',
      },
      immutable: { commonjs2: 'immutable', root: 'Immutable', var: 'Immutable' },
      'prop-types': { commonjs2: 'prop-types', root: 'PropTypes', var: 'PropTypes' },
      react: { commonjs2: 'react', root: 'React', var: 'React' },
      'react-dom': { commonjs2: 'react-dom', root: 'ReactDOM', var: 'ReactDOM' },
      'react-helmet': { commonjs2: 'react-helmet', root: 'ReactHelmet', var: 'ReactHelmet' },
      'react-redux': { commonjs2: 'react-redux', root: 'ReactRedux', var: 'ReactRedux' },
      redux: { commonjs2: 'redux', root: 'Redux', var: 'Redux' },
      reselect: { commonjs2: 'reselect', root: 'Reselect', var: 'Reselect' },
    });
  });
  test('load custom webpack config', () => {
    const config = createHolocronModuleWebpackConfig({
      webpackConfigPath: 'webpack.config.js',
    });
    expect(validate(config).length).toBe(3);
  });
});
