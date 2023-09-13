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
import express from 'express';
import parrot from 'parrot-middleware';

import {
  logError,
  logMockAction,
  logMockWatchReady,
  warnOnMockWatchError,
  logScenariosRegistered,
} from '../utils/logs';
import { publish } from '../utils/publish';
import { ufs } from '../utils/virtual-file-system';
import { watchFiles } from '../utils/watcher';
import { getModuleFromFilePath } from '../utils/helpers';
import { getScenarioPathForModule, getMockDirectoryForModule } from '../utils/paths';

export function loadScenarios(scenarioPaths = [], mockCache = []) {
  new Set([].concat(scenarioPaths, mockCache)).forEach((mockPath) => {
    delete require.cache[mockPath];
  });
  // TODO: safely source scenarios, use VM builtin module
  // TODO: warn when scenarios are overwritten between other module scenarios
  // eslint-disable-next-line global-require, import/no-dynamic-require -- requiring files at runtime
  return scenarioPaths.reduce((map, nextPath) => ({ ...map, ...require(nextPath) }), {});
}

export function createMockRouter() {
  const mockRouter = express.Router();
  mockRouter.reset = () => {
    // on every update, we want to clear all the middleware (stack)
    // in the router before we can add parrot middleware again
    if (mockRouter.stack.length > 0) mockRouter.stack = [];
  };
  mockRouter.loadScenarios = (scenarios) => {
    try {
      // use parrot middleware with loaded scenarios
      mockRouter.use(parrot(scenarios));
    } catch (e) {
      logError(e, e.stack);
    }
  };
  mockRouter.reload = (scenarios) => {
    mockRouter.reset();
    mockRouter.loadScenarios(scenarios);
  };
  return mockRouter;
}

export function createWatchEventHandler(context, operation) {
  return (filePath) => {
    const { modules, action, label } = context;
    const { moduleName } = getModuleFromFilePath({ modules, filePath });
    const [fileName] = filePath.split('mock/').reverse();
    operation();
    logMockAction({ fileName, moduleName, action: label });
    publish({
      action,
      path: fileName,
      moduleName,
    });
  };
}

export async function createHotParrotMiddleware({
  modules, mocks, scenarios, serverAddress,
}) {
  const mockRouter = createMockRouter();

  const watcher = await watchFiles(mocks, { awaitWriteFinish: true });

  const importScenarios = () => {
    const watched = watcher.getWatched();
    const mockCache = mocks
      .map((mockPath) => {
        const mockFiles = watched[mockPath];
        return mockFiles.map((fileName) => path.join(mockPath, fileName));
      })
      .reduce((array, next) => array.concat(next), []);
    try {
      const definitions = loadScenarios(scenarios, mockCache);
      mockRouter.reload(definitions);
      logScenariosRegistered({ serverAddress, scenarios: definitions });
    } catch (e) {
      logError(e.stack);
    }
  };

  logMockWatchReady();
  importScenarios();
  watcher
    .on('error', warnOnMockWatchError)
    .on('add', createWatchEventHandler({ modules, action: 'add', label: 'added' }, importScenarios))
    .on(
      'change',
      createWatchEventHandler({ modules, action: 'change', label: 'changed' }, importScenarios)
    )
    .on(
      'unlink',
      createWatchEventHandler({ modules, action: 'remove', label: 'removed' }, importScenarios)
    );

  return mockRouter;
}

export function getMocksFromModules(modules = []) {
  return modules
    .filter(({ modulePath }) => ufs.existsSync(getScenarioPathForModule(modulePath)))
    .map(({ modulePath }) => [
      getMockDirectoryForModule(modulePath),
      getScenarioPathForModule(modulePath),
    ])
    .reduce(
      ([mocks, scenarios], [mockDir, scenarioPath]) => [
        mocks.concat(mockDir),
        scenarios.concat(scenarioPath),
      ],
      [[], []]
    );
}

export default function createMocksMiddleware({ modules = [], serverAddress } = {}) {
  const [mocks, scenarios] = getMocksFromModules(modules);
  if (scenarios.length > 0) {
    return createHotParrotMiddleware({
      modules,
      mocks,
      scenarios,
      serverAddress,
    });
  }
  return Promise.resolve((_, __, next) => next());
}
