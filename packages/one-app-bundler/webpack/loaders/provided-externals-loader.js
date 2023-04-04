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

function providedExternalsLoader(content) {
  const options = loaderUtils.getOptions(this);

  const providedExternals = Array.isArray(options.providedExternals)
    ? options.providedExternals.reduce((obj, externalName) => ({
      ...obj,
      [externalName]: {
        enableFallback: false,
      },
    }), {}) : options.providedExternals;

  const extendedProvidedExternals = Object.keys(providedExternals).reduce((obj, externalName) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require -- need to require a package.json at runtime
    const externalPkg = require(`${externalName}/package.json`);

    return {
      ...obj,
      [externalName]: {
        ...providedExternals[externalName],
        version: externalPkg.version,
        module: `require('${externalName}')`,
      },
    };
  }, {});

  const match = content.match(/export\s+default\s+(?!from)(\w+);$/m);

  if (match) {
    return `${content};
${match[1]}.appConfig = Object.assign({}, ${match[1]}.appConfig, {
  providedExternals: ${JSON.stringify(extendedProvidedExternals, null, 2)},
});

if(global.getTenantRootModule === undefined || (global.rootModuleName && global.rootModuleName === '${options.moduleName}')){
global.getTenantRootModule = () => ${match[1]};
global.rootModuleName = '${options.moduleName}';
}
`;
  }

  throw new Error('@americanexpress/one-app-bundler: Module must use `export default VariableName` in index syntax to use providedExternals');
}

module.exports = providedExternalsLoader;
