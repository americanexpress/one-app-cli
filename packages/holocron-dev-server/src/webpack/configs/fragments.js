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

import {
  getContextPath,
} from '../../utils/paths';

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
