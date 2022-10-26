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

import { createRequire } from 'module';
import getModulesBundlerConfig from '../../utils/get-modules-bundler-config.js';
import getMetaUrl from '../../utils/get-meta-url.mjs';
import { BUNDLE_TYPES } from '../../constants/enums.js';

export default class ProvidedExternalsInjector {
  constructor({ bundleType, packageJson }) {
    this.moduleName = packageJson.name;

    const require = createRequire(getMetaUrl());

    const providedExternalNames = getModulesBundlerConfig('providedExternals');

    // no need to inject if there are no provided externals
    this.willInject = Array.isArray(providedExternalNames) && providedExternalNames.length > 0;

    if (!this.willInject) {
      return;
    }

    // we can build the string now, which might be a performance save,
    // but certainly isn't a performance loss
    this.providedExternalsString = providedExternalNames.map((externalName) => {
      // eslint-disable-next-line import/no-dynamic-require -- we need dynamic require here
      const { version } = require(`${externalName}/package.json`);
      return `'${externalName}': { version: '${version}', module: require('${externalName}')}`;
    }).join(',\n  ');

    this.globalReferenceString = bundleType === BUNDLE_TYPES.BROWSER ? 'globalThis' : 'global';
  }

  inject = async (content, { rootComponentName }) => {
    if (!this.willInject) {
      return content;
    }

    return `${content};
${rootComponentName}.appConfig = Object.assign({}, ${rootComponentName}.appConfig, {
  providedExternals: {
    ${this.providedExternalsString},
  },
});

if(${this.globalReferenceString}.getTenantRootModule === undefined || (${this.globalReferenceString}.rootModuleName && ${this.globalReferenceString}.rootModuleName === '${this.moduleName}')){
${this.globalReferenceString}.getTenantRootModule = () => ${rootComponentName};
${this.globalReferenceString}.rootModuleName = '${this.moduleName}';
}
`;
  }
}
