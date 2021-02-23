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

import TerserPlugin from 'terser-webpack-plugin';

export const STATIC_DIR = 'static';
export const MODULES_DIR = 'modules';
export const EXTERNAL_DIR = 'vendor';
export const TEMP_DIR = '.temp';

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

export function getContext() {
  return process.cwd();
}

export function getStaticPath(filePath = '', context) {
  return path.resolve(context || getContext(), STATIC_DIR, filePath);
}

export function getModulesPath(filePath = '', context) {
  return path.resolve(context || getContext(), STATIC_DIR, MODULES_DIR, filePath);
}

export function getPublicPath(moduleName) {
  return [STATIC_DIR, MODULES_DIR].concat(moduleName || []).join('/');
}

export function getExternalsPublicPath(resource) {
  return [STATIC_DIR, EXTERNAL_DIR].concat(resource || []).join('/');
}

export function createExternalEntry([packageName, varName] = []) {
  return {
    [packageName]: {
      commonjs2: packageName,
      ...varName ? {
        var: varName,
        root: varName,
      } : {},
    },
  };
}

export function createOneAppExternals(providedExternals = []) {
  return [
    ['@americanexpress/one-app-ducks', 'OneAppDucks'],
    ['@americanexpress/one-app-router', 'OneAppRouter'],
    ['create-shared-react-context', 'CreateSharedReactContext'],
    ['holocron', 'Holocron'],
    ['holocron-module-route', 'HolocronModuleRoute'],
    ['immutable', 'Immutable'],
    ['prop-types', 'PropTypes'],
    ['react', 'React'],
    ['react-dom', 'ReactDOM'],
    ['react-helmet', 'ReactHelmet'],
    ['react-redux', 'ReactRedux'],
    ['redux', 'Redux'],
    ['reselect', 'Reselect'],
    ...providedExternals,
  ]
    .map(createExternalEntry)
    .reduce((map, next) => ({ ...map, ...next }), {});
}

export function createHotModuleEntry({ moduleName, modulePath } = {}) {
  return {
    [moduleName]: [
      'react-refresh/runtime',
      'webpack-hot-middleware/client',
      `${modulePath}/src/index.js`,
    ],
  };
}

export function createHotModuleEntries(modules = []) {
  return modules
    .map(createHotModuleEntry)
    .reduce((map, next) => ({ ...map, ...next }), {});
}

// eslint-disable-next-line camelcase
export function createMinifyConfig({ isDev = isDevelopment(), keep_fnames = true } = {}) {
  return {
    devtool: isDev && 'eval-cheap-source-map',
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          test: /\.jsx?$/i,
          terserOptions: {
            keep_fnames,
          },
        }),
      ],
    },
  };
}
