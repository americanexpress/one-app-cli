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
  DllPlugin,
  validate,
  HotModuleReplacementPlugin,
  EnvironmentPlugin,
  DefinePlugin,
  DllReferencePlugin,
} from 'webpack';
import merge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import {
  getContextPath,
  getVendorsPath,
  getReportFilename,
  getModulesPath,
  getPublicModulesUrl,
  createModuleScriptUrl,
} from '../../utils/paths';
import {
  externalsLibraryVarName,
  jsxTest,
  modulesLibraryVarName,
  getWebpackVersion,
  createOneAppExternals,
  createHolocronModuleEntries,
} from '../helpers';
import { externalsBundleName, modulesBundleName } from '../../constants';
import {
  createResolverConfigFragment,
} from './fragments';
import {
  fileLoader,
  cssLoader,
  jsxLoader,
} from './loaders';
import HolocronModulePlugin from '../plugins/holocron-webpack-plugin';

export function createExternalsDllWebpackConfig({
  entries,
} = {}) {
  return {
    target: 'web',
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: jsxTest,
          loader: require.resolve('esbuild-loader'),
          options: {
            loader: 'jsx',
            target: 'es2018',
          },
        },
      ],
    },
    entry: { 'holocron-externals': entries },
    output: {
      path: getVendorsPath(),
      filename: '[name].js',
      library: externalsLibraryVarName,
    },
    plugins: [
      new DllPlugin({
        context: getContextPath(),
        name: externalsLibraryVarName,
        path: getVendorsPath(`${'holocron-externals'}.dll.json`),
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: `./${getReportFilename('holocron-externals')}`,
      }),
    ],
  };
}

export function createHolocronModuleWebpackConfig({
  modules: holocronModules = [],
  externals: holocronModuleExternals = [],
  environmentVariables,
  globalDefinitions,
  purgeCssOptions,
  webpackConfigPath,
}) {
  const webpackVersion = getWebpackVersion();
  const libKey = webpackVersion >= 5 ? 'uniqueName' : 'library';
  const hashName = webpackVersion >= 5 ? 'fullhash' : 'hash';
  let config = merge(
    createResolverConfigFragment({ modules: holocronModules }),
    {
      entry: createHolocronModuleEntries({ modules: holocronModules }),
      externals: createOneAppExternals(),
      target: 'web',
      mode: 'development',
      devtool: 'source-map',
      output: {
        publicPath: getPublicModulesUrl(),
        path: getModulesPath(),
        filename: createModuleScriptUrl('[name]'),
        [libKey]: modulesLibraryVarName,
        hotUpdateChunkFilename: `[name]/[id].[${hashName}].hot-update.js`,
        hotUpdateMainFilename: `__hot/[${hashName}].hot-update.json`,
      },
      optimization: {
        runtimeChunk: 'single',
      },
      module: {
        rules: [
          fileLoader().rule,
          cssLoader({ purgeCssOptions }).rule,
          jsxLoader().rule,
        ],
      },
      plugins: [
        new HolocronModulePlugin({
          modules: holocronModules,
          externals: holocronModuleExternals,
          hot: true,
        }),
        new HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin({
          forceEnable: true,
          library: modulesLibraryVarName,
          overlay: {
            sockIntegration: 'whm',
          },
        }),
        new EnvironmentPlugin({
          ...environmentVariables,
          NODE_ENV: 'development',
        }),
        new DefinePlugin({
          ...globalDefinitions,
          'global.BROWSER': JSON.stringify(true),
        }),
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          generateStatsFile: false,
          logLevel: 'silent',
          analyzerMode: 'static',
          reportFilename: `./${getReportFilename(modulesBundleName)}`,
        }),
      ],
    }
  );

  if (holocronModuleExternals.length > 0) {
    config = merge(
      {
        plugins: [
          new DllReferencePlugin({
            context: getContextPath(),
            name: externalsLibraryVarName,
            manifest: getVendorsPath(`${externalsBundleName}.dll.json`),
          }),
        ],
      },
      config
    );
  }

  if (webpackConfigPath) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const customWebpackConfig = require(getContextPath(webpackConfigPath));
    config = merge(config, customWebpackConfig);
  }

  validate(config);

  return config;
}
