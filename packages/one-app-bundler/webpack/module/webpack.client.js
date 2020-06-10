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

const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const readPkgUp = require('read-pkg-up');
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
const WebpackCustomChunkIdPlugin = require('webpack-custom-chunk-id-plugin');
const HolocronModuleRegisterPlugin = require('holocron-module-register-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');

const extendWebpackConfig = require('../../utils/extendWebpackConfig');
const commonConfig = require('../webpack.common');
const getConfigOptions = require('../../utils/getConfigOptions');

const {
  babelLoader,
  cssLoader,
  purgeCssLoader,
  sassLoader,
} = require('../loaders/common');

const packageRoot = process.cwd();
const { pkg } = readPkgUp.sync();
const { version, name } = pkg;

module.exports = (babelEnv) => {
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
        library: 'holocronModule',
        libraryExport: 'default',
      },
      resolve: {
        mainFields: ['browser', 'module', 'main'],
        modules: [packageRoot, 'node_modules'],
        extensions: ['.js', '.jsx'],
      },
      node: { module: 'empty', net: 'empty', fs: 'empty' },
      performance: {
        maxAssetSize: configOptions.performanceBudget || 250e3,
        maxEntrypointSize: configOptions.performanceBudget || 250e3,
        hints: process.env.NODE_ENV === 'development' ? 'warning' : 'error',
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            include: [path.join(packageRoot, 'src'), path.join(packageRoot, 'node_modules')],
            use: [babelLoader(babelEnv)],
          },
          {
            test: /\.s?css$/,
            use: [
              { loader: 'style-loader' },
              cssLoader({ name }),
              ...purgeCssLoader(),
              sassLoader(),
            ],
          },
        ],
      },
      plugins: [
        new HolocronModuleRegisterPlugin(name),
        new webpack.DefinePlugin({
          'global.BROWSER': JSON.stringify(true),
        }),
        new WebpackDynamicPublicPathPlugin({
          externalPublicPath: `__CLIENT_HOLOCRON_MODULE_MAP__.modules['${name}'].baseUrl`,
        }),
        new SriPlugin({
          hashFuncNames: ['sha256', 'sha384'],
          enabled: true,
        }),
        new WebpackCustomChunkIdPlugin({
          hash: true,
          append: `.${name}`,
        }),
      ],
    }
  ), 'client');
};
