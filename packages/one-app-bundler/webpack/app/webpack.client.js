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
const merge = require('webpack-merge');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const coreJsCompat = require('core-js-compat');
const coreJsEntries = require('core-js-compat/entries');
const { browserList, legacyBrowserList } = require('babel-preset-amex/browserlist');
const createResolver = require('../createResolver');
const { externals: moduleExternals, ...common } = require('../webpack.common');
const {
  babelLoader,
  cssLoader,
  sassLoader,
} = require('../loaders/common');

const mainFields = ['browser', 'module', 'main'];
const resolve = createResolver({ mainFields });

const exposeModuleExternals = Object
  .entries(moduleExternals)
  .map(([externalName, externalConfig]) => ({
    test: resolve(externalName),
    use: [{
      loader: 'expose-loader',
      options: externalConfig.var,
    }],
  }));

const packageRoot = process.cwd();
let pathsToTranspile = [path.resolve(packageRoot, 'src')];
if (process.env.NODE_ENV === 'production' || process.env.DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION !== 'true') {
  pathsToTranspile = pathsToTranspile.concat(path.resolve(packageRoot, 'node_modules'));
}


const getCoreJsModulePaths = (targets) => {
  const filter = /^es\.|web\./;
  const moduleNames = coreJsCompat({ filter, targets }).list;
  return Object.keys(coreJsEntries)
    .filter((entry) => entry.startsWith('core-js/stable'))
    .filter((entry) => coreJsEntries[entry]
      .filter((moduleName) => moduleNames.includes(moduleName)).length);
};

module.exports = (babelEnv) => merge(
  common,
  {
    output: {
      path: path.resolve(packageRoot, `build/app/tmp${babelEnv !== 'modern' ? '/legacy' : ''}`),
      filename: '[name].js',
    },
    entry: {
      app: './src/client/client',
      vendors: [
        ...(babelEnv !== 'modern' ? ['cross-fetch', 'url-polyfill'] : []),
        ...(babelEnv !== 'modern' ? getCoreJsModulePaths(legacyBrowserList) : getCoreJsModulePaths(browserList)).map(resolve),
        resolve('regenerator-runtime/runtime'),
        ...Object.keys(moduleExternals).map(resolve),
      ],
    },
    resolve: {
      alias: {
        'transit-js': path.resolve(packageRoot, 'src/universal/vendors/transit-amd-min.js'),
      },
      extensions: ['.js', '.jsx'],
      mainFields,
      modules: [packageRoot, 'node_modules'],
    },
    plugins: [
      new webpack.DefinePlugin({
        'global.BROWSER': JSON.stringify(true),
      }),
      new webpack.EnvironmentPlugin([
        'NODE_ENV',
      ]),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: pathsToTranspile,
          exclude: new RegExp(`^${path.resolve(packageRoot, 'node_modules', 'core-js')}`),
          use: [babelLoader(babelEnv)],
        }, {
          test: /\.(sa|sc|c)ss$/,
          use: [
            { loader: 'style-loader' },
            cssLoader({ importLoaders: 1 }),
            sassLoader(),
          ],
        },
        ...exposeModuleExternals,
      ],
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        minChunks: Infinity,
      },
      minimizer: [
        new TerserPlugin({
          test: /\.jsx?$/i,
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  }
);
