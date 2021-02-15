/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import loaderUtils from 'loader-utils';

const modify = (src, { moduleName, rootModuleName, externals }) => {
  if (!src.includes('/* Holocron Hot Module */')) {
    const modifiedSource = src.split('\n').map((line) => {
      if (line.startsWith('export default')) {
        const varName = line.replace('export default', '').replace(';', '').trim();

        const newLine = [
          'import wrapper from \'@americanexpress/one-app-hmr/lib/webpack/components/HolocronHmrWrapper.jsx\';',
          `${varName}.moduleName = "${moduleName}";`,
          `const HotHolocronModule = wrapper(${varName});`,
          'export default HotHolocronModule',
        ];

        if (rootModuleName === moduleName && externals.length > 0) {
          // add providedExternals
          const externalsMap = externals.map((externalName) => `'${externalName}': { module: require('${externalName}') },`).join('\n');
          newLine.push(
            'if (\'appConfig\' in HotHolocronModule === false) HotHolocronModule.appConfig = {};',
            `HotHolocronModule.appConfig.providedExternals = { ${externalsMap} };`,
            'window.getTenantRootModule = () => HotHolocronModule;'
          );
        }

        return newLine.join('\n');
      }
      return line;
    });
    modifiedSource.unshift('/* Holocron Hot Module */');
    return modifiedSource.join('\n').trim();
  }
  return src;
};

export default function HotHolocronModuleLoader(source) {
  const options = loaderUtils.getOptions(this);
  return modify(source, options);
}
