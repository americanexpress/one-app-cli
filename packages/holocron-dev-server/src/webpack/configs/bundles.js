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
} from 'webpack';
import merge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { getContextPath, getVendorsPath, getReportFilename } from '../../utils/paths';
import {
  externalsLibraryVarName,
  jsxTest,
} from '../helpers';
import { externalsBundleName, modulesBundleName } from '../../constants';
import {
  createResolverConfigFragment,
  createDllReferenceConfigFragment,
  createHolocronModulesConfigFragment,
  createEnvironmentDefinitionsConfigFragment,
  createBundleAnalyzerConfigFragment,
} from './fragments';
import {
  createJavaScriptSourceLoadersConfigFragment,
} from './loaders';

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
  hot = true,
  webpackConfigPath,
}) {
  let config = merge(
    {
      target: 'web',
      mode: 'development',
      devtool: 'source-map',
    },
    createResolverConfigFragment({ modules: holocronModules }),
    createHolocronModulesConfigFragment({
      modules: holocronModules,
      externals: holocronModuleExternals,
      hot,
    }),
    createJavaScriptSourceLoadersConfigFragment({
      purgeCssOptions,
      hot,
    }),
    createEnvironmentDefinitionsConfigFragment({
      environmentVariables,
      globalDefinitions,
    }),
    createBundleAnalyzerConfigFragment({
      name: modulesBundleName,
    })
  );

  if (holocronModuleExternals.length > 0) {
    config = merge(
      createDllReferenceConfigFragment({
        name: externalsBundleName,
      }),
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
