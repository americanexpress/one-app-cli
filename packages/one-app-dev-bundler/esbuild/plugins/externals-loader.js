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

import path from 'node:path';
import { readPackageUpSync } from 'read-pkg-up';

import { BUNDLE_TYPES } from '../constants/enums.js';
import getModulesBundlerConfig from '../utils/get-modules-bundler-config.js';

const externalsLoader = ({ bundleType }) => ({
  name: 'externalsLoader',
  setup(build) {
    const requiredExternalNames = getModulesBundlerConfig('requiredExternals');

    if (!Array.isArray(requiredExternalNames) || requiredExternalNames.length === 0) {
      return; // this module does not require any externals, so dont register the hooks
    }

    const { packageJson } = readPackageUpSync() || {};

    if (!packageJson) {
      throw new Error("Missing 'package.json'");
    }

    const { dependencies } = packageJson;

    if (!dependencies) {
      throw new Error("'package.json' does not have 'dependencies' key");
    }

    const globalReferenceString = bundleType === BUNDLE_TYPES.BROWSER ? 'globalThis' : 'global';

    requiredExternalNames.forEach((requiredExternalName) => {
      // FIXME: escape characters
      const filterRegex = new RegExp(`^${requiredExternalName}$`);

      build.onResolve({ filter: filterRegex }, (args) => ({ path: args.path, namespace: 'externalsLoader' }));
    });

    // The only way to define an onLoad based upon the 'shortname' of a package (such as 'react')
    // is to define an 'onResolve' for each of your shortnames, then in that 'onResolve'
    // return a namespace. (see this above)
    // your onLoad can then just match .* within that namespace and you guarantee you target
    // every package you want.
    build.onLoad({ filter: /.*/, namespace: 'externalsLoader' }, async ({ path: externalName }) => {
      const version = readPackageUpSync({
        cwd: path.resolve(process.cwd(), 'node_modules', externalName),
      })?.packageJson.version;

      return {
        loader: 'js',
        contents: `
          try {
            const Holocron = ${bundleType === BUNDLE_TYPES.SERVER ? 'require("holocron")' : `${globalReferenceString}.Holocron`};
            const fallbackExternal = Holocron.getExternal({
              name: '${externalName}',
              version: '${version}'
            });
            const rootModuleExternal = ${globalReferenceString}.getTenantRootModule && ${globalReferenceString}.getTenantRootModule().appConfig.providedExternals['${externalName}'];

            module.exports = fallbackExternal || (rootModuleExternal ? rootModuleExternal.module : () => {
              throw new Error('[${bundleType.toString()}][${packageJson.name}] External not found: ${externalName}');
            })
          } catch (error) {
            const errorGettingExternal = new Error([
              '[${bundleType.toString()}] Failed to get external fallback ${externalName}',
              error.message
            ].filter(Boolean).join(' :: '));

            errorGettingExternal.shouldBlockModuleReload = false;

            throw errorGettingExternal;
          }
        `,
      };
    });
  },
});

export default externalsLoader;
