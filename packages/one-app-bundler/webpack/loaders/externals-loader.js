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

const loaderUtils = require('loader-utils');
const readPkgUp = require('read-pkg-up');

const { packageJson } = readPkgUp.sync();

function requiredExternalsLoader(content) {
  const { externalName, bundleTarget } = loaderUtils.getOptions(this);

  if (bundleTarget === 'server') {
    return `\
  const rootModuleExternal = global.getTenantRootModule && global.getTenantRootModule().appConfig.providedExternals['${externalName}']

  if (rootModuleExternal && require('holocron').validateExternal({
    providedVersion: rootModuleExternal.version,
    requestedRange: '${packageJson.dependencies[externalName]}'
  })) {
    try {
      module.exports = rootModuleExternal.module;
    } catch (error) {
      const errorGettingExternal = new Error('Failed to get external ${externalName} from root module');
      errorGettingExternal.shouldBlockModuleReload = false;
      throw errorGettingExternal;
    }
  } else {
    ${content};
  }
`;
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require -- need to require a package.json at runtime
  const { version } = require(`${externalName}/package.json`);

  // client
  return `\
try {
  const fallbackExternal = global.Holocron.getExternal({
    name: '${externalName}',
    version: '${version}'
  });
  const rootModuleExternal = global.getTenantRootModule && global.getTenantRootModule().appConfig.providedExternals['${externalName}'];

  module.exports = fallbackExternal || (rootModuleExternal ? rootModuleExternal.module : () => {
    throw new Error('External not found: ${externalName}')
  });
} catch (error) {
  const errorGettingExternal = new Error('Failed to get external fallback ${externalName}');
  errorGettingExternal.shouldBlockModuleReload = false;
  throw error;
}
`;
}

module.exports = requiredExternalsLoader;
