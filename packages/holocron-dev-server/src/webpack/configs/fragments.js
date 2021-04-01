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

import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import {
  HotModuleReplacementPlugin,
  DllReferencePlugin,
  DllPlugin,
  EnvironmentPlugin,
  DefinePlugin,
} from 'webpack';

import { modulesBundleName, externalsBundleName } from '../../constants';
import {
  isDevelopment,
  getContextPath,
  getModulesPath,
  getVendorsPath,
  getPublicModulesUrl,
  createModuleScriptUrl,
  getReportFilename,
} from '../../utils';
import { HolocronModulePlugin } from '../plugins';
import {
  modulesLibraryVarName,
  externalsLibraryVarName,
  getWebpackVersion,
  createOneAppExternals,
  createHolocronModuleEntries,
} from '../helpers';

export function createBrowserConfigFragment({ isDev = isDevelopment(), sourceMap } = {}) {
  return {
    target: 'web',
    mode: isDev ? 'development' : 'production',
    devtool: sourceMap || (isDev && 'eval-cheap-source-map'),
  };
}

export function createDllReferenceConfigFragment({ name = externalsBundleName } = {}) {
  return {
    plugins: [
      new DllReferencePlugin({
        context: getContextPath(),
        name: externalsLibraryVarName,
        manifest: getVendorsPath(`${name}.dll.json`),
      }),
    ],
  };
}

export function createDllBundleConfigFragment({
  name = externalsBundleName,
  entries = [],
  externals = createOneAppExternals(),
} = {}) {
  return {
    // name,
    entry: { [name]: entries },
    externals,
    output: {
      path: getVendorsPath(),
      filename: '[name].js',
      library: externalsLibraryVarName,
    },
    plugins: [
      new DllPlugin({
        context: getContextPath(),
        name: externalsLibraryVarName,
        path: getVendorsPath(`${name}.dll.json`),
      }),
    ],
  };
}

export function createHolocronModulesConfigFragment({ modules, externals, hot } = {}) {
  const webpackVersion = getWebpackVersion();
  const libKey = webpackVersion >= 5 ? 'uniqueName' : 'library';
  const hashName = webpackVersion >= 5 ? 'fullhash' : 'hash';
  const fragment = {
    entry: createHolocronModuleEntries({ modules, hot }),
    externals: createOneAppExternals(),
    output: {
      publicPath: getPublicModulesUrl(),
      path: getModulesPath(),
      filename: createModuleScriptUrl('[name]'),
      [libKey]: modulesLibraryVarName,
    },
    optimization: {
      runtimeChunk: 'single',
    },
    plugins: [
      new HolocronModulePlugin({
        modules,
        externals,
        hot,
      }),
    ],
  };

  // base hot module reload with webpack
  if (hot) {
    fragment.plugins.push(new HotModuleReplacementPlugin());
    Object.assign(fragment.output, {
      hotUpdateChunkFilename: `[name]/[id].[${hashName}].hot-update.js`,
      hotUpdateMainFilename: `__hot/[${hashName}].hot-update.json`,
    });
  }

  return fragment;
}

export function createBundleAnalyzerConfigFragment({ name = modulesBundleName } = {}) {
  return {
    plugins: [
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: `./${getReportFilename(name)}`,
      }),
    ],
  };
}

export function createEnvironmentDefinitionsConfigFragment({
  isDev = isDevelopment(),
  environmentVariables = {},
  globalDefinitions = {},
  browser = true,
} = {}) {
  return {
    plugins: [
      new EnvironmentPlugin({
        ...environmentVariables,
        NODE_ENV: isDev ? 'development' : 'production',
      }),
      new DefinePlugin({
        ...globalDefinitions,
        'global.BROWSER': JSON.stringify(browser),
      }),
    ],
  };
}

export function createResolverConfigFragment({
  context = getContextPath(),
  modules,
  alias = {},
}) {
  const resolveModulePackages = [
    // Relative paths
    // default node modules
    'node_modules',
    // package level node modules
    path.relative(context, path.resolve(__dirname, '..', '..', '..', 'node_modules')),
  ].concat(
    // Absolute paths
    // TODO: document experimental features
    // EXPERIMENTAL - pre formal API
    // project level importing from 'src/', eg "components/Form.jsx", "childRoutes"
    modules.map(({ modulePath }) => path.resolve(context, path.join(modulePath, 'src'))),
    // other modules loaded in and their package context
    modules.map(({ modulePath }) => path.resolve(context, path.join(modulePath, 'node_modules')))
  );

  return {
    context,
    resolve: {
      mainFields: ['module', 'browser', 'main'],
      extensions: ['.js', '.jsx'],
      modules: resolveModulePackages,
      alias,
    },
    resolveLoader: {
      modules: resolveModulePackages,
    },
  };
}

export function createWatchOptionsConfigFragment() {
  return {
    watchOptions: {
      aggregateTimeout: 200,
      ignored: '**/node_modules',
    },
  };
}
