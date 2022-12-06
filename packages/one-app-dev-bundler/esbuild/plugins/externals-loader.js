/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { BUNDLE_TYPES } from '../constants/enums.js';
import getModulesBundlerConfig from '../utils/get-modules-bundler-config.js';

const externalsLoader = ({ bundleType }) => ({
  name: 'externalsLoader',
  setup(build) {
    const requiredExternalNames = getModulesBundlerConfig('requiredExternals');

    if (!Array.isArray(requiredExternalNames) || requiredExternalNames.length === 0) {
      return; // this module does not require any externals, so dont register the hooks
    }

    const globalReferenceString = bundleType === BUNDLE_TYPES.BROWSER ? 'globalThis' : 'global';

    requiredExternalNames.forEach((requiredExternalName) => {
      const filterRegex = new RegExp(`^${requiredExternalName}$`);

      build.onResolve({ filter: filterRegex }, (args) => ({ path: args.path, namespace: 'externalsLoader' }));
    });

    // The only way to define an onLoad based upon the 'shortname' of a package (such as 'react')
    // is to define an 'onResolve' for each of your shortnames, then in that 'onResolve'
    // return a namespace. (see this above)
    // your onLoad can then just match .* within that namespace and you guarantee you target
    // every package you want.
    build.onLoad({ filter: /.*/, namespace: 'externalsLoader' }, async (args) => {
      const jsContent = `\
try {
  module.exports = ${globalReferenceString}.getTenantRootModule().appConfig.providedExternals['${args.path}'].module;
} catch (error) {
  const errorGettingExternal = new Error('Failed to get external ${args.path} from root module');
  errorGettingExternal.shouldBlockModuleReload = false;
  throw errorGettingExternal;
}
`;

      return {
        contents: jsContent,
        loader: 'js',
      };
    });
  },
});

export default externalsLoader;
