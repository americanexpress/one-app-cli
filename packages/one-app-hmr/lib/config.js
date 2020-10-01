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

import fs from 'fs';
import path from 'path';
import readPkgUp from 'read-pkg-up';

import {
  getContext,
  getPublicPath,
  getModulesPath,
} from './webpack/utility';
import { debug } from './logs';

export const defaultConfig = {
  modules: [],
  externals: [],
  scenarios: [],
  locales: [],
  port: 4000,
  logLevel: 2,
  dockerImage: 'oneamex/one-app-dev',
  oneAppSource: 'docker', // "docker" or "git"
  rootModule: 'root-module',
  remoteModuleMap: null,
  useParrotMiddleware: true,
  useLanguagePacks: true,
};

export function getDefaultScenariosPath(modulePath = getContext()) {
  const scenariosPath = path.resolve(modulePath, 'mock', 'scenarios.js');
  if (fs.existsSync(scenariosPath)) return scenariosPath;
  return [];
}

export function getDefaultLocalesPath(modulePath = getContext()) {
  const localesPath = path.resolve(modulePath, 'locale');
  if (fs.existsSync(localesPath)) return modulePath;
  return [];
}

export const ONE_AMEX_CONFIG_KEY = 'one-amex';
export const BUNDLER_CONFIG_KEY = 'bundler';
export const RUNNER_CONFIG_KEY = 'runner';
export const HMR_CONFIG_KEY = 'hmr';

// eslint-disable-next-line complexity
export async function getModuleConfig(modulePath = getContext()) {
  const {
    packageJson: {
      [ONE_AMEX_CONFIG_KEY]: oneAmexConfig,
      name: moduleName,
      version: moduleVersion,
    },
  } = await readPkgUp({ cwd: modulePath });

  const {
    [RUNNER_CONFIG_KEY]: {
      modules, rootModuleName, moduleMapUrl, dockerImage,
    } = { modules: ['.'], rootModuleName: moduleName },
    [BUNDLER_CONFIG_KEY]: { providedExternals = [], requiredExternals } = {},
    [HMR_CONFIG_KEY]: hmr = {},
  } = oneAmexConfig || {};

  const localModules = (hmr.modules || modules || [])
    .map((pathName) => path.resolve(modulePath, pathName))
    .filter((pathName) => pathName !== modulePath)
    .filter((pathName) => fs.existsSync(pathName));

  const languagePacks = []
    .concat(hmr.languagePacks || [], getDefaultLocalesPath(modulePath))
    .filter((pathName) => fs.existsSync(pathName));
  const scenarios = []
    .concat(hmr.scenarios || [], getDefaultScenariosPath(modulePath)
    ).filter((pathName) => fs.existsSync(pathName));
  const externals = [...new Set([].concat(
    hmr.externals || [],
    providedExternals || [],
    requiredExternals || []
  )).values()];

  const moduleConfig = {
    moduleName,
    moduleVersion,
    modulePath,
    externals,
    scenarios,
    languagePacks,
    // hmr profile
    modules: localModules,
    dockerImage: hmr.dockerImage || dockerImage,
    logLevel: hmr.logLevel || 2,
    port: hmr.port || 4000,
    useParrotMiddleware: hmr.useParrotMiddleware || true,
    useLanguagePacks: hmr.useLanguagePacks || true,
    oneAppSource: hmr.oneAppSource || 'docker', // "docker" or "git"
    rootModuleName: hmr.rootModuleName || rootModuleName,
    remoteModuleMap: hmr.remoteModuleMap || moduleMapUrl,
  };

  return moduleConfig;
}

export async function createConfig(initialConfig) {
  const baseConfig = initialConfig || await getModuleConfig();
  const {
    context = getContext(),
    publicPath = getPublicPath(),
    staticPath = getModulesPath(),
  } = baseConfig;
  const config = {
    ...defaultConfig,
    ...baseConfig,
    context,
    publicPath,
    staticPath,
  };

  const modules = await Promise.all(config.modules.map(getModuleConfig));
  modules.unshift(config);
  config.modules = modules;
  config.entryModule = config.moduleName;
  config.scenarios = []
    .concat(modules.map(({ scenarios }) => scenarios))
    .map((paths) => [].concat(paths).filter((pathName) => fs.existsSync(pathName)))
    .reduce((scenariosArray, nextSet) => scenariosArray.concat(nextSet), []);
  config.languagePacks = []
    .concat(modules.map(({ languagePacks }) => languagePacks))
    .map((paths) => [].concat(paths).filter((pathName) => fs.existsSync(pathName)))
    .reduce((langPacksArray, nextSet) => langPacksArray.concat(nextSet), []);
  config.externals = [
    ...(new Set(
      modules.reduce((externalsArray, { externals }) => externalsArray.concat(externals), [])
    ).values()),
  ];

  debug('configuration %o', config.entryModule);

  return config;
}
