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

export function injectHolocronModuleWrapper({
  varName, moduleName,
}) {
  const sourceToInject = [
    `import wrapper from '${packageName}/src/components/HolocronHmrWrapper.jsx';`,
    `${varName}.moduleName = "${moduleName}";`,
    `const ${moduleVariableName} = wrapper(${varName});`,
    `export default ${moduleVariableName};`,
  ];
  return sourceToInject.join('\n');
}

export default function HolocronModuleLoader(source) {
  const { moduleName } = loaderUtils.getOptions(this);
  if (!source.includes(fileBanner)) {
    const modifiedSource = source.split('\n').map((line) => {
      if (line.startsWith('export default')) {
        const varName = line.replace('export default', '').replace(';', '').trim();
        return injectHolocronModuleWrapper({
          varName,
          moduleName,
        });
      }
      return line;
    });
    modifiedSource.unshift(fileBanner);
    return modifiedSource.join('\n').trim();
  }
  return source;
}
