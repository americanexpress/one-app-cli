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
import path from 'node:path';
import { merge } from 'webpack-merge';
import { readPackageUpSync } from 'read-package-up';
import HolocronModuleRegisterPlugin from 'holocron-module-register-webpack-plugin';
import { SubresourceIntegrityPlugin as SriPlugin } from 'webpack-subresource-integrity';
import { BUNDLE_TYPES } from '@americanexpress/one-app-dev-bundler';
import extendWebpackConfig from '../../utils/extendWebpackConfig.js';
import commonConfig from '../webpack.common.js';
import getConfigOptions from '../../utils/getConfigOptions.js';
import {
  babelLoader,
} from '../loaders/common.js';
import createResolver from '../createResolver.js';

const resolve = createResolver({ mainFields: ['browser', 'module', 'main'] });
const packageRoot = process.cwd();
const { packageJson } = readPackageUpSync();
const { version, name } = packageJson;

const holocronModuleName = `holocronModule_${name.replace(/-/g, '_')}`;
const webpackClient = async (babelEnv) => {
  const configOptions = getConfigOptions();

  return extendWebpackConfig(merge(
    commonConfig,
    {
      entry: './src/index.js',
      output: {
        crossOriginLoading: 'anonymous',
        path: path.join(packageRoot, 'build', version),
        publicPath: '__holocron_publicPath_placeholder__',
        filename: `${name}.${babelEnv !== 'modern' ? 'legacy.browser' : 'browser'}.js`,
        chunkFilename: `[name].chunk.${babelEnv !== 'modern' ? 'legacy.browser' : 'browser'}.js`,
        library: holocronModuleName,
        libraryExport: 'default',
      },
      resolve: {
        mainFields: ['browser', 'module', 'main'],
        modules: [packageRoot, 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
          assert: resolve('assert'),
          buffer: resolve('buffer'),
          console: resolve('console-browserify'),
          constants: resolve('constants-browserify'),
          crypto: resolve('crypto-browserify'),
          domain: resolve('domain-browser'),
          events: resolve('events'),
          http: resolve('stream-http'),
          https: resolve('https-browserify'),
          os: resolve('os-browserify/browser'),
          path: resolve('path-browserify'),
          punycode: resolve('punycode'),
          process: resolve('process/browser'),
          querystring: resolve('querystring-es3'),
          stream: resolve('stream-browserify'),
          string_decoder: resolve('string_decoder'),
          sys: resolve('util'),
          timers: resolve('timers-browserify'),
          tty: resolve('tty-browserify'),
          url: resolve('url'),
          util: resolve('util'),
          vm: resolve('vm-browserify'),
          zlib: resolve('browserify-zlib'),
        },
      },
      performance: {
        maxAssetSize: configOptions.performanceBudget || 250e3,
        maxEntrypointSize: configOptions.performanceBudget || 250e3,
        hints: babelEnv !== 'legacy' && (process.env.NODE_ENV === 'development' ? 'warning' : 'error'),
      },
      module: {
        rules: [
          {
            test: path.join(packageRoot, 'src', 'index'),
            use: [
              {
                loader: '@americanexpress/one-app-bundler/webpack/loaders/public-path-loader',
                options: {
                  externalPublicPath: `__CLIENT_HOLOCRON_MODULE_MAP__.modules['${name}'].baseUrl`,
                },
              },
            ],
          },
          {
            test: /[jt]sx?$/,
            include: [path.join(packageRoot, 'src'), path.join(packageRoot, 'node_modules')],
            use: [babelLoader(babelEnv)],
          },
          {
            test: /\.(sa|sc|c)ss$/,
            use: [
              {
                loader: '@americanexpress/one-app-bundler/webpack/loaders/styles-loader',
                options: {
                  cssModulesOptions: {},
                  bundleType: BUNDLE_TYPES.BROWSER,
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new HolocronModuleRegisterPlugin(name, holocronModuleName),
        new webpack.DefinePlugin({
          'global.BROWSER': JSON.stringify(true),
          global: 'globalThis',
        }),
        new SriPlugin({
          hashFuncNames: ['sha256', 'sha384'],
          enabled: true,
        }),
      ],
    }
  ), 'client');
};

export default webpackClient;
