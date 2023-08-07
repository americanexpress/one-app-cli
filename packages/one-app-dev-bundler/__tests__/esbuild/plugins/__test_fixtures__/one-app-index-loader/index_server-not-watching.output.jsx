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

const ModuleRootComponent = ({ children }) => (
  <div>
    {children}
  </div>
);

export default ModuleRootComponent;

ModuleRootComponent.appConfig = Object.assign({}, ModuleRootComponent.appConfig, {
  appCompatibility: "mockAppCompatibility",
});

ModuleRootComponent.appConfig = Object.assign({}, ModuleRootComponent.appConfig, {
  providedExternals: {
    'external-package-1': {
      ...{"fallbackEnabled":false},
      version: '1.2.3',
      module: require('external-package-1')
    },
  'external-package-2': {
      ...{"fallbackEnabled":false},
      version: '4.5.6',
      module: require('external-package-2')
    },
  },
});

if(global.getTenantRootModule === undefined || (global.rootModuleName && global.rootModuleName === 'axp-mock-module-name')){
  global.getTenantRootModule = () => ModuleRootComponent;
  global.rootModuleName = 'axp-mock-module-name';
};

ModuleRootComponent.appConfig = Object.assign({}, ModuleRootComponent.appConfig, {
  enableUnlistedExternalFallbacks: "false",
});

ModuleRootComponent.__holocron_module_meta_data__ = {
  version: 'mockModuleVersion',
};
