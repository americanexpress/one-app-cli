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

import path from 'node:path';
import chokidar from 'chokidar';

import { logLocaleAction, logLocaleModuleNamesBeingWatched, warnOnLocaleWatchError } from './logs';
import { publish } from './publish';
import { getModuleInfoFromLocalePath } from './helpers';

export function watchFiles(filePaths, options) {
  const watcher = chokidar.watch(filePaths, options);
  return new Promise((resolve, reject) => {
    watcher.on('error', reject).on('ready', resolve.bind(null, watcher));
  });
}

export function createLanguagePackWatchEventHandler(context, operation) {
  return (filePath) => {
    const { action, label } = context;
    const [moduleName, modulePath, locale, localeSymbol] = getModuleInfoFromLocalePath(filePath);
    operation({
      filePath,
      moduleName,
      modulePath,
      locale,
      localeSymbol,
    });
    logLocaleAction({ locale, moduleName, action });
    publish({
      action: label,
      path: filePath,
      moduleName,
      locale: localeSymbol,
    });
  };
}

export async function createLanguagePackWatcher(
  { modules = [] } = {},
  { add, change, remove } = {}
) {
  const watcherOptions = { awaitWriteFinish: true };
  const watcherPaths = modules.map(({ modulePath }) => path.join(modulePath, 'locale'));
  const watcher = await watchFiles(watcherPaths, watcherOptions);

  const moduleNames = modules.map(({ moduleName }) => moduleName);
  logLocaleModuleNamesBeingWatched(moduleNames);

  watcher
    .on('error', warnOnLocaleWatchError)
    .on('add', createLanguagePackWatchEventHandler({ action: 'added', label: 'locale:add' }, add))
    .on(
      'change',
      createLanguagePackWatchEventHandler({ action: 'changed', label: 'locale:change' }, change)
    )
    .on(
      'unlink',
      createLanguagePackWatchEventHandler({ action: 'removed', label: 'locale:remove' }, remove)
    );

  return watcher;
}
