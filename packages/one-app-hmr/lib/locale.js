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

import path from 'path';
import chokidar from 'chokidar';
import { execSync } from 'child_process';

import {
  debug, log, warn, time, palegreen,
} from './logs';

export function printLocale() {
  return palegreen('locale');
}

export function buildHotModuleLocale(modulePath) {
  return execSync('bundle-module-locale', { cwd: modulePath });
}

export function updateModuleBundle(fileName) {
  const [modulePath] = fileName.split('/locale/');
  // TODO: update language packs individually, rather than in bulk per module
  log([printLocale(), buildHotModuleLocale(modulePath).toString().trim()].join(' - '));
}

export function getModuleInfoFromLocalePath(filePath) {
  const [moduleBasePath, fileBasePath] = filePath.split('/locale/');
  const [moduleName] = moduleBasePath.split('/').reverse();
  const [locale] = fileBasePath.split('/');
  return [moduleName, locale.toLowerCase().replace('.json', '')];
}

export async function createHotLanguagePacks(modulePaths, publish) {
  chokidar.watch(modulePaths.map((modulePath) => path.resolve(modulePath, 'locale')), { awaitWriteFinish: true })
    .on('error', (error) => warn(`${printLocale()} - Language pack watcher error: ${error}`))
    .on('ready', () => log(`${printLocale()} - Watching language packs`))
    .on('add', async (fileName) => {
      const [moduleName, locale] = getModuleInfoFromLocalePath(fileName);
      log(`${printLocale()} - "${locale}" for module "${moduleName}" has been added`);
      updateModuleBundle(fileName);
      publish({
        action: 'locale:add', path: fileName, moduleName, locale,
      });
    })
    .on('change', async (fileName) => {
      const [moduleName, locale] = getModuleInfoFromLocalePath(fileName);
      log(`${printLocale()} - "${locale}" for module "${moduleName}" has been changed`);
      updateModuleBundle(fileName);
      publish({
        action: 'locale:change', path: fileName, moduleName, locale,
      });
    })
    .on('unlink', async (fileName) => {
      const [moduleName, locale] = getModuleInfoFromLocalePath(fileName);
      log(`${printLocale()} - "${locale}" for module "${moduleName}" has been removed`);
      updateModuleBundle(fileName);
      publish({
        action: 'locale:remove', path: fileName, moduleName, locale,
      });
    });
}

export async function loadLanguagePacks(app, { languagePacks, useLanguagePacks, publish }) {
  debug(`${printLocale()} "useLanguagePacks" was set to "%s"`, useLanguagePacks);

  if (useLanguagePacks && languagePacks.length > 0) {
    debug(`${printLocale()} Loading language packs %o`, languagePacks);
    await time(`${printLocale()} - initializing`, () => {
      createHotLanguagePacks(languagePacks, publish);
    });
  } else {
    debug(`${printLocale()} Locale folders were not found`);
  }
}
