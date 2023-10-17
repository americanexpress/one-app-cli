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
import { readPackageUpSync } from 'read-pkg-up';
import loadExternalsPackageJson from '../../utils/loadExternalsPackageJson.js';

const { packageJson } = readPackageUpSync();

async function externalsLoader() {
  const { externalName, bundleTarget } = this.getOptions();
  const { version } = await loadExternalsPackageJson(externalName);

  return `\
try {
  const Holocron = ${bundleTarget === 'server' ? 'require("holocron")' : 'global.Holocron'};
  const fallbackExternal = Holocron.getExternal && Holocron.getExternal({
    name: '${externalName}',
    version: '${version}'
  });
  const rootModuleExternal = global.getTenantRootModule && global.getTenantRootModule().appConfig.providedExternals['${externalName}'];

  module.exports = fallbackExternal || (rootModuleExternal ? rootModuleExternal.module : () => {
    throw new Error('[${bundleTarget}][${packageJson.name}] External not found: ${externalName}');
  })
} catch (error) {
  const errorGettingExternal = new Error([
    '[${bundleTarget}] Failed to get external fallback ${externalName}',
    error.message
  ].filter(Boolean).join(' :: '));

  errorGettingExternal.shouldBlockModuleReload = false;

  throw errorGettingExternal;
}
`;
}

export default externalsLoader;
