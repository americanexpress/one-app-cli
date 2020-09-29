/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import CopyPlugin from 'copy-webpack-plugin';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import HotHolocronModulePlugin from './plugins/hot-holocron';

import {
  getContext,
  getPublicPath,
  getModulesPath,
  createOneAppExternals,
  createHotModuleEntries,
} from './utility';
import {
  jsxLoader,
  cssLoader,
  fileLoader,
} from './loaders';
import { createDLLConfig } from './dll';
import { debug } from '../logs';

// eslint-disable-next-line import/prefer-default-export
export function createHotModuleWebpackConfig({ modules = [], externals = [], entryModule = {} }) {
  const context = getContext();
  const publicPath = getPublicPath();
  const staticPath = getModulesPath();

  const { rootModuleName } = entryModule;

  const languagePacksToCopy = modules
    .filter(({ languagePacks }) => languagePacks.length > 0)
    .map(({ moduleName, moduleVersion, modulePath }) => ({
      from: path.join('**', `${moduleName}.json`),
      to: `${moduleName}/`,
      context: path.join(modulePath, 'build', moduleVersion),
    }));

  const entryConfig = {
    entry: createHotModuleEntries(modules),
  };

  debug('Webpack entries configuration used %o', entryConfig);

  return merge(
    entryConfig,
    (externals && externals.length > 0 ? createDLLConfig({
      dllAsReference: true,
    }) : {}),
    {
      externals: createOneAppExternals(externals),
      target: 'web',
      mode: 'development',
      devtool: 'source-map',
      context,
      output: {
        path: staticPath,
        filename: '[name]/[name].js',
        hotUpdateChunkFilename: '[name]/[id].[hash].hot-update.js',
        publicPath: `/${publicPath}/`,
      },
      resolve: {
        mainFields: ['module', 'browser', 'main'],
        modules: [
          'node_modules',
          path.relative(context, path.resolve(__dirname, '..', '..', 'node_modules')),
        ].concat(modules.map(({ modulePath }) => path.join(modulePath, 'node_modules'))),
        extensions: ['.js', '.jsx'],
      },
      resolveLoader: {
        modules: [
          'node_modules',
          path.resolve(__dirname, '..', '..', 'node_modules'),
        ],
        extensions: ['.js', '.json'],
        mainFields: ['loader', 'main'],
      },
      module: {
        rules: [
          jsxLoader({ plugins: ['react-refresh/babel'] }),
          cssLoader,
          fileLoader,
        ],
      },
      plugins: [
        new webpack.EnvironmentPlugin({
          NODE_ENV: 'development',
        }),
        new webpack.DefinePlugin({
          'global.BROWSER': JSON.stringify(true),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin({
          overlay: {
            sockIntegration: 'whm',
          },
        }),
        // source injection
        new HotHolocronModulePlugin({
          rootModuleName,
          modules,
          externals,
        }),
        // css/styles
        new ExtractCssChunks({
          filename: '[name]/[name].css',
        }),
      ].concat(
        languagePacksToCopy.length > 0
        // copies (and updates) the language packs for a module
          ? new CopyPlugin({
            patterns: languagePacksToCopy,
          })
          : []
      ),
    }
  );
}
