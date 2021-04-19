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

import loaderUtils from 'loader-utils';

import { packageName } from '../../constants';

export const fileBanner = '/* Holocron Module */';
export const moduleVariableName = 'HolocronModule';
export const globalExternalsName = '__holocron_externals__';
export const globalModulesName = '__holocron_modules__';

export function createExternalsMap(externals) {
  const externalsMap = externals
    .map((externalName) => `'${externalName}': { module: require('${externalName}') },`)
    .join('\n');
  return `{\n${externalsMap}\n}`;
}

export function createAppConfigForExternalsSource(externals) {
  const externalsMap = createExternalsMap(externals);
  return [].concat(
    `window.${globalExternalsName} = ${externalsMap};`,
    `if ('appConfig' in ${moduleVariableName} === false) ${moduleVariableName}.appConfig = {};`,
    `${moduleVariableName}.appConfig.providedExternals = window.${globalExternalsName};`,
    `window.getTenantRootModule = () => ${moduleVariableName};`
  );
}

export function injectHolocronModuleWrapper({ hot, varName, moduleName, rootModule, externals }) {
  const wrapperFileName = hot ? 'HolocronHmrWrapper' : 'RegisterModule';
  const sourceToInject = [
    `import wrapper from '${packageName}/src/components/${wrapperFileName}.jsx';`,
    `${varName}.moduleName = "${moduleName}";`,
    `const ${moduleVariableName} = wrapper(${varName});`,
    `export default ${moduleVariableName};`,
  ];

  if (rootModule && externals.length > 0) {
    // adding providedExternals to any root modules being bundled and supplying
    sourceToInject.push(...createAppConfigForExternalsSource(externals));
  }

  return sourceToInject.join('\n');
}

export function modify(src, { hot, rootModule, moduleName, externals }) {
  if (!src.includes(fileBanner)) {
    const modifiedSource = src.split('\n').map((line) => {
      if (line.startsWith('export default')) {
        const varName = line.replace('export default', '').replace(';', '').trim();
        return injectHolocronModuleWrapper({
          hot,
          varName,
          moduleName,
          rootModule,
          externals,
        });
      }
      return line;
    });
    modifiedSource.unshift(fileBanner);
    return modifiedSource.join('\n').trim();
  }
  return src;
}

export default function HolocronModuleLoader(source) {
  const options = loaderUtils.getOptions(this);
  return modify(source, options);
}
