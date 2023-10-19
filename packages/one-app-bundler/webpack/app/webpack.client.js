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
import { merge } from 'webpack-merge';
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
import coreJsCompat from 'core-js-compat';
import { browserList, legacyBrowserList } from 'babel-preset-amex/browserlist.js';
import createResolver from '../createResolver.js';
import common from '../webpack.common.js';
import { babelLoader, cssLoader, sassLoader } from '../loaders/common.js';
import '../../utils/patchedCryptoHash.js';
import loadJsonWithImport from '../../utils/loadJsonWithImport.js';

const { externals: moduleExternals } = common;
const mainFields = ['browser', 'module', 'main'];
const resolve = createResolver({ mainFields });

const exposeModuleExternals = Object
  .entries(moduleExternals)
  .map(([externalName, externalConfig]) => (console.log('MRP 7', resolve(externalName)),{
    test: resolve(externalName),
    use: [{
      loader: 'expose-loader',
      options: {
        exposes: externalConfig.var,
      },
    }],
  }));

const packageRoot = process.cwd();
let pathsToTranspile = [path.resolve(packageRoot, 'src')];
if (process.env.NODE_ENV === 'production' || process.env.DANGEROUSLY_DISABLE_DEPENDENCY_TRANSPILATION !== 'true') {
  pathsToTranspile = pathsToTranspile.concat(path.resolve(packageRoot, 'node_modules'));
}

const getCoreJsModulePaths = async (targets) => {
  const filter = /^es\.|web\./;
  const moduleNames = coreJsCompat({ filter, targets }).list;
  const coreJsEntries = await loadJsonWithImport('core-js-compat/entries.json');
  return Object.keys(coreJsEntries)
    .filter((entry) => entry.startsWith('core-js/stable'))
    .filter((entry) => coreJsEntries[entry]
      .filter((moduleName) => moduleNames.includes(moduleName)).length);
};

const appClientConfig = async (babelEnv) => merge(
  common,
  {
    output: {
      path: path.resolve(packageRoot, `build/app/tmp${babelEnv !== 'modern' ? '/legacy' : ''}`),
      filename: '[name].js',
    },
    entry: {
      app: './src/client/client',
      vendors: [
        ...babelEnv !== 'modern' ? ['cross-fetch/polyfill', 'url-polyfill', 'abort-controller/polyfill'] : [],
        ...(babelEnv !== 'modern' ? await getCoreJsModulePaths(legacyBrowserList) : await getCoreJsModulePaths(browserList)).map(resolve),
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
      fallback: { url: resolve('url/'), util: resolve('util/') },
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
        minChunks: Number.POSITIVE_INFINITY,
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

export default appClientConfig;
