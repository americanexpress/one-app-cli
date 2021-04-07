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

import { validate } from 'webpack';
import merge from 'webpack-merge';

import { getContextPath, isDevelopment } from '../../utils';
import { externalsBundleName, modulesBundleName } from '../../constants';
import {
  createBrowserConfigFragment,
  createResolverConfigFragment,
  createDllBundleConfigFragment,
  createDllReferenceConfigFragment,
  createHolocronModulesConfigFragment,
  createEnvironmentDefinitionsConfigFragment,
  createBundleAnalyzerConfigFragment,
} from './fragments';
import {
  createJavaScriptSourceLoadersConfigFragment,
  createEsBuildConfigFragment,
} from './loaders';

export function createExternalsDllWebpackConfig({
  isDev = isDevelopment(),
  entries,
  externals,
  minify,
  sourceMap = 'source-map',
  target = 'es2018',
  name = externalsBundleName,
} = {}) {
  return merge(
    createBrowserConfigFragment({ isDev, sourceMap }),
    createEsBuildConfigFragment({ minify, target }),
    createDllBundleConfigFragment({
      name,
      entries,
      externals,
    }),
    createBundleAnalyzerConfigFragment({ name })
  );
}

export function createHolocronModuleWebpackConfig({
  isDev = isDevelopment(),
  modules: holocronModules = [],
  externals: holocronModuleExternals = [],
  environmentVariables,
  globalDefinitions,
  purgeCssOptions,
  terserOptions,
  sourceMap = 'source-map',
  minify = false,
  hot = true,
  webpackConfigPath,
}) {
  let config = merge(
    createBrowserConfigFragment({ isDev, sourceMap }),
    createResolverConfigFragment({ modules: holocronModules }),
    createHolocronModulesConfigFragment({
      modules: holocronModules,
      externals: holocronModuleExternals,
      hot,
    }),
    createJavaScriptSourceLoadersConfigFragment({
      minify,
      terserOptions,
      purgeCssOptions,
      hot,
    }),
    createEnvironmentDefinitionsConfigFragment({
      isDev,
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
