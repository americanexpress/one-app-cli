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

import { modulesBundleName } from '../../constants';
import {
  getPublicModulesUrl,
  joinUrlFragments,
  getReportFilename,
} from '../paths';

import {
  info,
  logError,
  warn,
  log,
  yellow,
  orange,
  green,
  magenta,
  dodgerblue,
  deeppink,
  palegreen,
  blueviolet,
} from './logs';

export function printWebpack(message) {
  return `${magenta('webpack')} - ${message}`;
}

export function printProxy(message) {
  return `${dodgerblue('proxy')} - ${message}`;
}

export function printMock(message) {
  return `${deeppink('mocks')} - ${message}`;
}

export function printLocale(message) {
  return `${palegreen('locale')} - ${message}`;
}

export function printModuleMap(message) {
  return `${blueviolet('module-map')} - ${message}`;
}

export function printStatics(message) {
  return `${orange('statics')} - ${message}`;
}

// Webpack

export function logWebpackStatsWhenDone(stats) {
  const { errors, warnings } = stats.compilation;
  errors.forEach((message) => logError(message));
  warnings.forEach((message) => warn(message));
  log(printWebpack(`webpack built in ${orange(`${stats.endTime - stats.startTime}`)} ms`));
}

export function logWhenWebpackInvalid() {
  log(printWebpack(orange('webpack building...')));
}

export function logHotReloadReady() {
  info(printWebpack(`${orange('🔥 Holocron module reload is ready')}`));
}

export function logWebpackInit() {
  log(printWebpack('initializing webpack'));
}

export function logServerStart({ rootModuleName }) {
  info(orange.bold('Starting Holocron dev server'));
  log(`Root Holocron module: ${orange.bold(JSON.stringify(rootModuleName))}`);
}

export function logServerUrl(serverAddress, port) {
  log(`Server is listening on port ${yellow(`"${port}"`)}`);
  log(`visit ${yellow.bold(`"${serverAddress}"`)} to start!\n`);
}

export function logModuleBundlerAnalyzerUrl(serverAddress) {
  const analyzerHtml = joinUrlFragments(
    serverAddress,
    getPublicModulesUrl(getReportFilename(modulesBundleName))
  );
  log(
    printWebpack(orange('Bundle Analyzer for local Holocron modules is available at \n\n   %s')),
    yellow.bold(`"${analyzerHtml}"\n`)
  );
}

// HTML

export function logRenderedHolocronModules(modules) {
  log(
    `rendered HTML document using local modules: [ ${orange.bold(
      modules.map(({ moduleName }) => `"${moduleName}"`).join(', ')
    )} ]`
  );
}

// Proxy

export function logProxyRequestMatch(req) {
  log(printProxy(`Matched remote for ${yellow('"%s"')}`), req.path);
}

export function logRemoteHasBeenLoadedCached(remoteUrl) {
  log(printProxy(`Fetched and stored remote from ${yellow('"%s"')}`), remoteUrl);
}

// Mocks

export function logMockAction({ fileName, moduleName, action }) {
  log(
    printMock(
      `"${orange.bold(fileName)}" for module ${orange(`"${moduleName}"`)} has been ${action}`
    )
  );
}

export function logMockWatchReady() {
  log(printMock('Watching "/mock/" directory for scenarios change'));
}

export function warnOnMockWatchError(error) {
  warn(printMock(`Watch error: ${error}`));
}

export function logScenariosRegistered({ scenarios, serverAddress }) {
  const spacer = '    ';
  info(
    printMock(
      `Scenario routes registered: [\n${Object.keys(scenarios)
        .map((key) => [
          spacer,
          `"${key}" - ${yellow(
            `"${joinUrlFragments(serverAddress, (scenarios[key][0] || scenarios[key]).request)}"`
          )}`,
        ].join('')
        )
        .join(',\n')}\n  ]\n`
    )
  );
}

// Locales

export function logLocaleAction({ locale, moduleName, action }) {
  log(
    printLocale(
      `${orange(`"${locale}"`)} for module ${orange(`"${moduleName}"`)} has been ${action}`
    )
  );
}

export function logModuleLanguagePacksLoaded({ moduleName, languagePacks }) {
  log(
    printLocale(
      `Loaded language packs for ${orange(`"${moduleName}"`)}: [ ${languagePacks
        .map((langPack) => green(langPack))
        .join(', ')} ]`
    )
  );
}

export function logLocaleModuleNamesBeingWatched(moduleNames) {
  log(
    printLocale(
      `Watching language packs for modules: [ ${moduleNames
        .map((name) => orange(JSON.stringify(name)))
        .join(', ')} ]`
    )
  );
}

export function warnOnLocaleWatchError(error) {
  warn(printLocale(`Language pack watcher error: ${error}`));
}

// Module Map

export function logRemoteModulesLoaded(modules, localModuleNames) {
  const moduleNames = modules
    .map((moduleName) => {
      if (localModuleNames.includes(moduleName)) return magenta(`"${moduleName}"`);
      return orange(`"${moduleName}"`);
    })
    .join(', ');

  if (moduleNames.length > 0) {
    log(printModuleMap(`Remote Holocron modules in module map: [ ${moduleNames} ]`));
  }
}

export function logLocalModulesLoaded(modules) {
  log(
    printModuleMap(
      `Local Holocron modules loaded: [ ${modules
        .map((moduleName) => orange(`"${moduleName}"`))
        .join(', ')} ]`
    )
  );
}

export function errorOnRemoteModuleMapResponse() {
  logError(printModuleMap('fetching the remote module map has failed'));
}

export function errorOnRemoteModuleMapFetching(error) {
  logError(printModuleMap(error));
}

// Statics

export function logStaticStep() {
  info(printStatics('Loading up One App statics'));
}

export function logGitIgnoreAddition() {
  log(printStatics('Adding "statics/" directory to .gitignore'));
}

export function logPullingDockerImage() {
  log(printStatics('Pulling Docker image to extract One App statics'));
}

export function logOneAppVersion(appVersion) {
  log(printStatics('Using One App version v%s'), appVersion);
}
