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

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const readPkgUp = require('read-pkg-up');

const extendWebpackConfig = require('../../utils/extendWebpackConfig');
const commonConfig = require('../webpack.common');
const {
  babelLoader,
  cssLoader,
  purgeCssLoader,
  sassLoader,
} = require('../loaders/common');

const packageRoot = process.cwd();
const { pkg } = readPkgUp.sync();
const { version, name } = pkg;

module.exports = extendWebpackConfig(merge(
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
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [path.join(packageRoot, 'src'), path.join(packageRoot, 'node_modules')],
          use: [babelLoader()],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/ssr-css-loader', options: { name },
            },
            cssLoader({ name }),
            ...purgeCssLoader(),
            sassLoader(),
          ],
        },
        {
          test: path.join(packageRoot, 'src', 'index'),
          use: [
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/ssr-css-loader/index-style-loader',
            },
            {
              loader: '@americanexpress/one-app-bundler/webpack/loaders/meta-data-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
  }
), 'server');
