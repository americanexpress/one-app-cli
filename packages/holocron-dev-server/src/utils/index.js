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

export * from './helpers';
export * from './paths';
export * from './publish';
export * from './virtual-file-system';
export * from './watcher';

export {
  loadModuleLanguagePack,
  loadModuleLanguagePacks,
  writeModuleLanguagePacksToVolume,
  addModuleLanguagePackToVolume,
  removeModuleLanguagePackFromVolume,
  loadLanguagePacks,
} from './language-packs';

export {
  loadRemoteModuleMap,
  createLocalModuleMap,
  createUnifiedModuleMap,
  createModuleMap,
} from './module-map';

export {
  renderDocument,
  createInitialState,
  getEntryScriptsForExternals,
  getWebpackScriptsForLocalModules,
} from './rendering';

export { loadStatics, loadOneAppStaticsFromDocker, addStaticsDirToGitIgnore } from './statics';
