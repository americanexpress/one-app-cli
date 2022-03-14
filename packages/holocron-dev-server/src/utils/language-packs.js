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

import path from 'path';
import jsonParse from 'json-parse-context';

import { volume, ufs } from './virtual-file-system';
import { getModulesPath, getLocalesPathForModule } from './paths';
import { logModuleLanguagePacksLoaded } from './logs';
import { createLanguagePackWatcher } from './watcher';

export const localePathName = 'locale';
export const languagePackFileNames = ['copy', 'integration'];

export function readJsonFile(filePath) {
  const json = ufs.readFileSync(filePath).toString();
  return jsonParse(json);
}

export function loadModuleLanguagePack({
  moduleName, modulePath, localePath = localePathName, locale,
}) {
  let languagePackPath = path.join(modulePath, localePath, locale);

  if (!ufs.existsSync(languagePackPath)) {
    languagePackPath = path.join(modulePath, localePath, `${locale}.json`);
  }

  if (ufs.existsSync(languagePackPath)) {
    const fileStats = ufs.statSync(languagePackPath);
    if (fileStats.isDirectory()) {
      const languagePack = {};
      const scan = [
        ...languagePackFileNames,
        locale,
        moduleName,
      ];
      scan
        .map((fileName) => `${fileName}.json`)
        .map((fileName) => path.join(languagePackPath, fileName))
        .filter((filePath) => ufs.existsSync(filePath))
        .forEach((filePath) => {
          Object.assign(languagePack, readJsonFile(filePath));
        }
        );
      const directories = ufs.readdirSync(languagePackPath, { withFileTypes: true })
        .filter((files) => files.isDirectory()).map((files) => files.name);
      if (directories.length > 0) {
        directories.forEach((directoryName) => {
          scan
            .map((fileName) => path.join(languagePackPath, directoryName, `${fileName}.json`))
            .filter((directoryFilePath) => ufs.existsSync(directoryFilePath))
            .forEach((directoryFilePath) => {
              languagePack[directoryName] = readJsonFile(directoryFilePath);
            });
        }
        );
      }
      return languagePack;
    }
    if (fileStats.isFile()) {
      return readJsonFile(languagePackPath);
    }
  }

  return null;
}

export function loadModuleLanguagePacks({ moduleName, modulePath, localePath = localePathName }) {
  const languagePacksPath = path.join(modulePath, localePath);
  if (!ufs.existsSync(languagePacksPath)) return [];

  return ufs
    .readdirSync(languagePacksPath)
    .map((locale) => locale.replace(/(\..*)$/, '').toLowerCase())
    .map((locale) => [
      locale,
      loadModuleLanguagePack({
        moduleName, modulePath, localePath, locale,
      }),
    ])
    .filter(([, languagePack]) => !!languagePack);
}

export function writeModuleLanguagePacksToVolume({
  modulePath,
  moduleName,
  localePath = localePathName,
}) {
  const languagePacks = loadModuleLanguagePacks({ moduleName, modulePath, localePath });
  const locales = languagePacks.reduce(
    (map, [locale, langPack]) => ({
      ...map,
      [[locale, `${moduleName}.json`].join('/')]: JSON.stringify(langPack),
    }),
    {}
  );
  volume.fromJSON(locales, getModulesPath(moduleName));
  return languagePacks.map(([locale]) => locale);
}

export function addModuleLanguagePackToVolume({ filePath, moduleName, locale }) {
  const localeSymbol = locale.replace(/(\..*)$/, '').toLowerCase();
  const modulePath = filePath.split('/').reduce((pathName, next) => (pathName.endsWith(moduleName) ? pathName : [pathName, next].join('/')), '');
  const langPack = loadModuleLanguagePack({
    moduleName, modulePath, locale: localeSymbol,
  });
  const bundlePath = getModulesPath([moduleName, localeSymbol, `${moduleName}.json`].join('/'));
  volume.writeFileSync(bundlePath, JSON.stringify(langPack));
}

export function removeModuleLanguagePackFromVolume({ moduleName, locale }) {
  const localeFilePath = getModulesPath(
    [moduleName, locale.replace(/(\..*)$/, '').toLowerCase(), `${moduleName}.json`].join('/')
  );
  volume.unlinkSync(localeFilePath);
  volume.rmdirSync(localeFilePath.replace(`/${moduleName}.json`, ''));
}

export function loadLanguagePacks({ modules = [] } = {}) {
  const modulePaths = modules
    .filter(({ modulePath }) => ufs.existsSync(getLocalesPathForModule(modulePath)))
    .map(({ modulePath }) => modulePath);

  if (modulePaths.length > 0) {
    modulePaths.forEach((modulePath) => {
      const [moduleName] = modulePath.split(path.sep).reverse();
      const languagePacks = writeModuleLanguagePacksToVolume({ modulePath, moduleName });
      logModuleLanguagePacksLoaded({ moduleName, languagePacks });
    });
    return createLanguagePackWatcher(
      { modules },
      {
        add: addModuleLanguagePackToVolume,
        change: addModuleLanguagePackToVolume,
        remove: removeModuleLanguagePackFromVolume,
      }
    );
  }
  return Promise.resolve();
}
