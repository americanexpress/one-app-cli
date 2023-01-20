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
const { snakeCase } = require('lodash');
const { EXTERNAL_PREFIX } = require('../..');

function sharedExternalsLoader(content) {
  const { externalName } = loaderUtils.getOptions(this);
  const externalFileName = `/sharedExternals/${externalName}.js`;
  const assetInfo = { sourceFilename: externalFileName };
  this.emitFile(externalFileName, content, null, assetInfo);
  return `\
try {
  module.exports = ${EXTERNAL_PREFIX}${snakeCase(externalName)};
} catch (error) {
  const errorGettingExternal = new Error('Failed to get external ${externalName} from root module');
  errorGettingExternal.shouldBlockModuleReload = false;
  throw error;
}
`;
}

module.exports = sharedExternalsLoader;
