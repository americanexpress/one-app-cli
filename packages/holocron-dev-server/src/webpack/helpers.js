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

import { version } from 'webpack';

export const modulesLibraryVarName = '__holocron_modules__';

export function getWebpackVersion() {
  return Number.parseInt(version, 10);
}

export function createExternalEntry([packageName, varName]) {
  return {
    [packageName]: {
      commonjs2: packageName,
      var: varName,
      root: varName,
    },
  };
}

export function createOneAppExternals() {
  // TODO: pull this from one-app-bundler when merging
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
  ]
    .map(createExternalEntry)
    .reduce((map, next) => ({ ...map, ...next }), {});
}

const createHotModuleEntry = ({ moduleName, modulePath }) => ({
  [moduleName]: [
    require.resolve('webpack-hot-middleware/client'),
    require.resolve('react-refresh/runtime'),
    `${modulePath}/src/index.js`,
  ],
});

export function createHolocronModuleEntries({ modules = [] } = {}) {
  return modules
    .map((module) => createHotModuleEntry(module))
    .reduce((map, next) => ({ ...map, ...next }), {});
}
