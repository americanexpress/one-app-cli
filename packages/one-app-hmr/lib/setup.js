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
import { exec, execSync, spawnSync } from 'child_process';
import readPkgUp from 'read-pkg-up';
import fetch from 'cross-fetch';
import webpack from 'webpack';

import {
  createOneAppExternals, getContext, getStaticPath, STATIC_DIR, TEMP_DIR,
} from './webpack/utility';
import { createDLLConfig } from './webpack';
import { debug } from './logs';

export const ONE_AMEX_CONFIG_KEY = 'one-amex';

export function getDefaultScenariosPath(modulePath = getContext()) {
  const scenariosPath = path.resolve(modulePath, 'mock', 'scenarios.js');
  if (fs.existsSync(scenariosPath)) return scenariosPath;
  return undefined;
}

export function getDefaultLocalesPath(modulePath = getContext()) {
  const localesPath = path.resolve(modulePath, 'locale');
  if (fs.existsSync(localesPath)) return modulePath;
  return undefined;
}

export async function getModuleConfig(modulePath = getContext()) {
  const {
    packageJson: {
      [ONE_AMEX_CONFIG_KEY]: oneAmexConfig,
      name: moduleName,
      version: moduleVersion,
    },
  } = await readPkgUp({ cwd: modulePath });
  const {
    runner: {
      modules = [], rootModuleName, moduleMapUrl, dockerImage,
    } = { modules: ['.'], rootModuleName: moduleName },
    bundler: { providedExternals = [], requiredExternals } = {},
    hmr = {},
  } = oneAmexConfig || {};
  const languagePacks = [].concat(hmr.languagePacks || [getDefaultLocalesPath(modulePath)])
    .filter((value) => !!value);
  const scenarios = [].concat(hmr.scenarios || [getDefaultScenariosPath(modulePath)])
    .filter((value) => !!value);

  const moduleConfig = {
    moduleName,
    moduleVersion,
    modulePath,
    dockerImage,
    remoteModuleMap: moduleMapUrl,
    modules: modules.map((pathName) => path.resolve(modulePath, pathName)),
    rootModuleName,
    providedExternals,
    requiredExternals,
    scenarios,
    languagePacks,
  };

  debug('module configuration %o', moduleConfig);

  return moduleConfig;
}

export async function loadRemoteModuleMap(remoteModuleMapUrl) {
  if (typeof remoteModuleMapUrl === 'string') {
    const response = await fetch(remoteModuleMapUrl);
    if (response.ok) {
      return response.json();
    }
    console.error('[One App HMR]: fetching the remote module map has failed');
  }

  return {
    modules: {},
  };
}

export async function getHMRConfig() {
  // TODO: consider making the config hot re-loadable as well, watch package.json
  const entryModule = await getModuleConfig();
  // "modules" may be empty, so we populate with loaded module
  const modules = await Promise.all(
    entryModule.modules
      .map((pathName) => path.resolve(pathName))
      .filter((pathName) => entryModule.modulePath !== pathName)
      .map(getModuleConfig)
  );
  modules.unshift(entryModule);

  const moduleScenarios = []
    .concat(modules.map(({ scenarios }) => scenarios))
    .map((paths) => [].concat(paths).filter((pathName) => fs.existsSync(pathName)))
    .reduce((scenariosArray, nextSet) => scenariosArray.concat(nextSet), []);
  const moduleLanguagePacks = []
    .concat(modules.map(({ languagePacks }) => languagePacks))
    .map((paths) => [].concat(paths).filter((pathName) => fs.existsSync(pathName)))
    .reduce((langPacksArray, nextSet) => langPacksArray.concat(nextSet), []);
  const moduleExternals = [
    ...(new Set(
      modules
        .map(({
          requiredExternals = [],
          providedExternals = [],
        }) => [].concat(requiredExternals, providedExternals))
        .reduce((externalsArray, nextSet) => externalsArray.concat(nextSet), [])
    ).values()),
  ];

  const remoteModuleMap = await loadRemoteModuleMap(entryModule.remoteModuleMap);

  const config = {
    port: 4000,
    oneAppSource: 'docker', // "docker" or "git"
    dockerImage: entryModule.dockerImage || 'oneamex/one-app-dev',
    useParrotMiddleware: true,
    useLanguagePacks: true,
    remoteModuleMap,
    entryModule,
    modules,
    scenarios: moduleScenarios,
    languagePacks: moduleLanguagePacks,
    externals: moduleExternals,
  };

  debug('configuration %o', config.entryModule);

  return config;
}

export function loadOneAppStaticsFromDocker({ tempDir, appDir, dockerImage } = {}) {
  execSync(`docker pull ${dockerImage}`, { stdio: 'inherit' });
  // TODO: consider windows for file paths
  execSync(
    `docker cp $(docker create ${dockerImage}):opt/one-app/build/ ./.temp`,
    { stdio: 'inherit' }
  );

  const [appVersion] = fs.readdirSync('.temp/app');
  spawnSync('mv', [path.join(tempDir, 'app', appVersion), appDir], {
    stdio: 'inherit',
  });
  spawnSync('rm', ['-R', tempDir], { stdio: 'inherit' });
}

export function loadOneAppStaticsFromGit() {
  // TODO: add alternative source for one-app statics (git)
  // build git source bundle with react-🔥-dom and add externals to DLL
  // shallow clone of default branch
  console.error('NOT IMPLEMENTED');
}

export function preloadOneAppStatics(config = {}) {
  const { oneAppSource = 'docker', dockerImage } = config;

  const outputDir = path.resolve(STATIC_DIR);
  const appDir = path.join(outputDir, 'app');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  if (!fs.existsSync(appDir)) {
    if (oneAppSource === 'docker') {
      loadOneAppStaticsFromDocker({
        tempDir: TEMP_DIR,
        appDir,
        dockerImage,
      });
    } else if (oneAppSource === 'git') {
      loadOneAppStaticsFromGit();
    }
  }

  // overwrite eval to allow HMR
  fs.writeFileSync(
    getStaticPath('app/app.js'),
    fs.readFileSync(getStaticPath('app/app.js')).toString().replace("['eval', 'execScript']", '[]')
  );
}

export function preBuildExternals(config = {}) {
  const { externals = [] } = config;

  if (externals.length > 0 === false) return Promise.resolve();

  return new Promise((resolve, reject) => {
    webpack(createDLLConfig({
      isDev: false,
      dllVendors: externals,
      dllExternals: createOneAppExternals(),
    })).run((error, stats) => {
      if (error) {
        reject(error);
        console.error(error);
      }
      resolve(stats);
    });
  });
}

export function modifySource() {
  // adds static/ to .gitignore only once
  const gitIgnorePath = path.resolve('.gitignore');
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnoreAddition = [
      '# added by One App HMR',
      'static/',
    ].join('\n');
    if (!fs.readFileSync(gitIgnorePath).toString().includes(gitIgnoreAddition)) {
      exec(`echo "\n${gitIgnoreAddition}\n" >> ${gitIgnorePath}`);
    }
  }
}
