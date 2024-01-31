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

import path from 'node:path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { readPackageUpSync } from 'read-pkg-up';
import { BUNDLE_TYPES } from '@americanexpress/one-app-dev-bundler';
import extendWebpackConfig from '../../utils/extendWebpackConfig.js';
import commonConfig from '../webpack.common.js';
import {
  babelLoader,
} from '../loaders/common.js';
import ServerSsrStylesInjectorPlugin from '../plugins/server-ssr-styles-injector.js';

const packageRoot = process.cwd();
const { packageJson } = readPackageUpSync();
const { version, name } = packageJson;

const webpackServer = extendWebpackConfig(merge(
  commonConfig,
  {
    entry: './src/index.js',
    output: {
      path: path.join(packageRoot, 'build', version),
      filename: `${name}.node.js`,
      libraryTarget: 'commonjs2',
      libraryExport: 'default',
    },
    target: 'async-node',
    resolve: {
      mainFields: ['module', 'main'],
      modules: [packageRoot, 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [path.join(packageRoot, 'src'), path.join(packageRoot, 'node_modules')],
          use: [babelLoader()],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/styles-loader',
              options: {
                cssModulesOptions: {},
                bundleType: BUNDLE_TYPES.SERVER,
              },
            },
          ],
        },
        {
          test: path.join(packageRoot, 'src', 'index'),
          use: [
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/index-server-ssr-styles-placeholder-loader',
            },
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/meta-data-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new ServerSsrStylesInjectorPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.DefinePlugin({
        'global.BROWSER': JSON.stringify(false),
        global: 'globalThis',
      }),
    ],
  }
), 'server');

export default webpackServer;
