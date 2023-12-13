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
import path from 'node:path';

async function providedExternalsLoader(content) {
  const { moduleName, providedExternals } = this.getOptions();

  const extendedProvidedExternals = await Promise.all((Array.isArray(providedExternals)
    ? providedExternals : Object.keys(providedExternals)).map(async (externalName) => {
    const version = readPackageUpSync({
      cwd: path.resolve(process.cwd(), 'node_modules', externalName),
    })?.packageJson.version;

    return `
      '${externalName}': {
        ...${JSON.stringify({
    fallbackEnabled: false,
    ...providedExternals[externalName],
  }, null, 2)},
        version: '${version}',
        module: require('${externalName}'),
      }`;
  }, {}));

  const match = content.match(/export\s+default\s+(?!from)(\w+);$/m);

  if (match) {
    return `${content};
${match[1]}.appConfig = Object.assign({}, ${match[1]}.appConfig, {
  providedExternals: {
    ${
  // NOTE: We need to use 'join' instead of JSON.stringify because it performs some escaping.
  extendedProvidedExternals.join(', \n')
}
  },
});

if(global.getTenantRootModule === undefined || (global.rootModuleName && global.rootModuleName === '${moduleName}')){
global.getTenantRootModule = () => ${match[1]};
global.rootModuleName = '${moduleName}';
}
`;
  }

  throw new Error('@americanexpress/one-app-bundler: Module must use `export default VariableName` in index syntax to use providedExternals');
}

export default providedExternalsLoader;
