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

function validateOneAppCompatabilityLoader(content) {
  const { appCompatibility } = loaderUtils.getOptions(this);
  const match = content.match(/export\s+default\s+(?!from)(\w+);$/m);

  if (match) {
    const newContent = `${content};
if (!global.BROWSER) {
  ${match[1]}.appConfig = Object.assign({}, ${match[1]}.appConfig, {
    appCompatibility: "${appCompatibility}",
  });
}
`;

    return newContent;
  }

  throw new Error('@americanexpress/one-app-bundler: Module must use `export default VariableName` in index syntax to use app compatibility validation');
}

module.exports = validateOneAppCompatabilityLoader;
