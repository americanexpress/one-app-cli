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

import * as utils from '../../../src/utils';

test('exports utils API functions', () => {
  expect(Object.keys(utils)).toEqual([
    'loadModuleLanguagePack',
    'loadModuleLanguagePacks',
    'writeModuleLanguagePacksToVolume',
    'addModuleLanguagePackToVolume',
    'removeModuleLanguagePackFromVolume',
    'loadLanguagePacks',
    'loadRemoteModuleMap',
    'createLocalModuleMap',
    'createUnifiedModuleMap',
    'createModuleMap',
    'renderDocument',
    'createInitialState',
    'getEntryScriptsForExternals',
    'getWebpackScriptsForLocalModules',
    'loadStatics',
    'loadOneAppStaticsFromDocker',
    'addStaticsDirToGitIgnore',
    'isDevelopment',
    'getLocalRootModule',
    'getModuleFromFilePath',
    'getModuleInfoFromLocalePath',
    'openBrowser',
    'getContextPath',
    'getStaticPath',
    'getModulesPath',
    'getOneAppPath',
    'getVendorsPath',
    'getTempPath',
    'getMockDirectoryForModule',
    'getScenarioPathForModule',
    'getLocalesPathForModule',
    'combineUrlFragments',
    'joinUrlFragments',
    'getPublicUrl',
    'getPublicModulesUrl',
    'getPublicAppUrl',
    'getPublicVendorsUrl',
    'createModuleScriptUrl',
    'getReportFilename',
    'STATIC_DIR',
    'ONE_APP_DIR',
    'MODULES_DIR',
    'EXTERNAL_DIR',
    'TEMP_DIR',
    'clearPublisher',
    'setPublisher',
    'publish',
    'volume',
    'vfs',
    'ufs',
    'watchFiles',
    'createLanguagePackWatchEventHandler',
    'createLanguagePackWatcher',
  ]);
});
