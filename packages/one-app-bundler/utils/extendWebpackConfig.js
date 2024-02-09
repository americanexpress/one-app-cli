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
import { merge, mergeWithCustomize } from 'webpack-merge';
import uniqBy from 'lodash/uniqBy.js';
import getConfigOptions from './getConfigOptions.js';
import getCliOptions from './getCliOptions.js';
import createResolver from '../webpack/createResolver.js';

function getCustomWebpackConfigPath(options, bundleTarget) {
  const { webpackConfigPath, webpackClientConfigPath, webpackServerConfigPath } = options;

  if (webpackConfigPath) return webpackConfigPath;
  if (bundleTarget === 'client' && webpackClientConfigPath) return webpackClientConfigPath;
  if (bundleTarget === 'server' && webpackServerConfigPath) return webpackServerConfigPath;

  return false;
}

function parseProvidedExternals(providedExternals) {
  return Array.isArray(providedExternals)
    ? providedExternals.reduce((obj, externalName) => ({
      ...obj,
      [externalName]: {
        enableFallback: false,
      },
    }), {}) : providedExternals;
}

async function extendWebpackConfig(webpackConfig, bundleTarget) {
  const configOptions = getConfigOptions();
  const cliOptions = getCliOptions();
  const { mainFields } = webpackConfig.resolve;
  const resolve = createResolver({ mainFields, resolveToContext: true });
  const {
    appCompatibility,
    requiredExternals,
    providedExternals,
    moduleName,
    enableUnlistedExternalFallbacks,
  } = configOptions;
  const { watch } = cliOptions;

  const customWebpackConfigPath = getCustomWebpackConfigPath(configOptions, bundleTarget);
  let customWebpackConfig = {};

  if (customWebpackConfigPath) {
    customWebpackConfig = (await import(path.join(process.cwd(), customWebpackConfigPath))).default;
  }

  const indexPath = path.join(process.cwd(), 'src', 'index');

  if (providedExternals) {
    const parsedProvidedExternals = parseProvidedExternals(providedExternals);
    customWebpackConfig = merge(customWebpackConfig, {
      module: {
        rules: [{
          test: indexPath,
          use: [{
            loader: '@americanexpress/one-app-bundler/webpack/loaders/provided-externals-loader',
            options: {
              providedExternals: parsedProvidedExternals,
              moduleName,
            },
          }],
        }],
      },
    });
  }

  if (requiredExternals) {
    customWebpackConfig = merge(customWebpackConfig, {
      module: {
        rules: [...requiredExternals.map((externalName) => ({
          test: resolve(externalName),
          use: [{
            loader: '@americanexpress/one-app-bundler/webpack/loaders/externals-loader',
            options: {
              externalName,
              bundleTarget,
            },
          }],
        })), {
          test: indexPath,
          use: [{
            loader: '@americanexpress/one-app-bundler/webpack/loaders/validate-required-externals-loader',
            options: {
              requiredExternals,
            },
          }],
        }],
      },
    });
  }

  if (enableUnlistedExternalFallbacks) {
    customWebpackConfig = merge(customWebpackConfig, {
      module: {
        rules: [{
          test: indexPath,
          use: [{
            loader: '@americanexpress/one-app-bundler/webpack/loaders/enable-unlisted-external-fallbacks-loader',
            options: {
              enableUnlistedExternalFallbacks,
            },
          }],
        }],
      },
    });
  }

  if (appCompatibility) {
    customWebpackConfig = merge(customWebpackConfig, {
      module: {
        rules: [{
          test: indexPath,
          use: [{
            loader: '@americanexpress/one-app-bundler/webpack/loaders/validate-one-app-compatibility-loader',
            options: {
              appCompatibility,
            },
          }],
        }],
      },
    });
  }

  if (watch) {
    customWebpackConfig = merge(customWebpackConfig, {
      watch: true,
      watchOptions: {
        aggregateTimeout: 500,
        ignored: /node_modules/,
      },
    });
  }

  return mergeWithCustomize({
    customizeArray(defaultConfig, customConfig, key) {
      if (key === 'plugins') {
        const merged = [...customConfig, ...defaultConfig];
        const unique = uniqBy(merged, (plugin) => plugin.constructor && plugin.constructor.name);
        return unique;
      }

      return undefined;
    },
  })(webpackConfig, customWebpackConfig);
}

export default extendWebpackConfig;
