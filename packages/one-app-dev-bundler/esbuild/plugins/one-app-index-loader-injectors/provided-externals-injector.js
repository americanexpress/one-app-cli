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

const getLength = (arg) => (Array.isArray(arg) ? arg.length : Object.keys(arg).length);

export default class ProvidedExternalsInjector {
  constructor({ bundleType, packageJson }) {
    this.moduleName = packageJson.name;

    const require = createRequire(getMetaUrl());

    const providedExternals = getModulesBundlerConfig('providedExternals');

    // no need to inject if there are no provided externals
    this.willInject = !!providedExternals && typeof providedExternals === 'object' && getLength(providedExternals) > 0;
    if (!this.willInject) {
      return;
    }

    const extendedProvidedExternals = (Array.isArray(providedExternals)
      ? providedExternals : Object.keys(providedExternals)).map((externalName) => {
    // eslint-disable-next-line import/no-dynamic-require -- need to require a package.json at runtime
      const externalPkg = require(`${externalName}/package.json`);

      const externalOpts = JSON.stringify({
        fallbackEnabled: false,
        ...providedExternals[externalName],
      }, null, 0);

      return `'${externalName}': {
      ...${externalOpts},
      version: '${externalPkg.version}',
      module: require('${externalName}')
    }`;
    }, {});

    this.providedExternalsString = extendedProvidedExternals.join(',\n  ');
    this.globalReferenceString = bundleType === BUNDLE_TYPES.BROWSER ? 'globalThis' : 'global';
  }

  inject = async (content, { rootComponentName }) => {
    if (!this.willInject) {
      return content;
    }

    return `${content}
${rootComponentName}.appConfig = Object.assign({}, ${rootComponentName}.appConfig, {
  providedExternals: {
    ${this.providedExternalsString},
  },
});

if(${this.globalReferenceString}.getTenantRootModule === undefined || (${this.globalReferenceString}.rootModuleName && ${this.globalReferenceString}.rootModuleName === '${this.moduleName}')){
  ${this.globalReferenceString}.getTenantRootModule = () => ${rootComponentName};
  ${this.globalReferenceString}.rootModuleName = '${this.moduleName}';
};
`;
  };
}
