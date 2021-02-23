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

import express from 'express';
import chokidar from 'chokidar';
import parrot from 'parrot-middleware';

import {
  debug, log, warn, time, deeppink,
} from './logs';

export function printParrot() {
  return deeppink('parrot');
}

export function loadScenarios(scenarioPaths) {
  scenarioPaths.forEach((scenarioPath) => {
    // TODO: imported/required js from the source scenario are not deleted from require.cache
    // and will not be updated if changed
    delete require.cache[scenarioPath];
  });
  // TODO: safely source scenarios
  // TODO: warn when scenarios are overwritten between other module scenarios
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return scenarioPaths.reduce((map, nextPath) => ({ ...map, ...require(nextPath) }), {});
}

export function getModuleNameFromFilePath(filePath) {
  const [moduleBasePath] = filePath.split('/mock/scenarios.js');
  const [moduleName] = moduleBasePath.split('/').reverse();
  return moduleName;
}

export function createHotParrotMiddleware(scenarios, publish) {
  const parrotRouter = express.Router();

  const mountScenarios = () => {
    if (parrotRouter.stack.length > 0) parrotRouter.stack = [];
    parrotRouter.use(parrot(loadScenarios(scenarios)));
  };

  chokidar.watch(scenarios, { awaitWriteFinish: true })
    .on('error', (error) => warn(`${printParrot()} - Watch error: ${error}`))
    .on('ready', () => {
      mountScenarios();
      log(`${printParrot()} - Watching scenarios`);
    })
    .on('add', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(`${printParrot()} - scenarios for "${moduleName}" has been added`);
      mountScenarios();
      publish({ action: 'parrot:add', path: fileName, moduleName });
    })
    .on('change', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(`${printParrot()} - scenarios for "${moduleName}" has been changed`);
      mountScenarios();
      publish({ action: 'parrot:change', path: fileName, moduleName });
    })
    .on('unlink', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(`${printParrot()} - scenarios for "${moduleName}" has been removed`);
      mountScenarios();
      publish({ action: 'parrot:remove', path: fileName, moduleName });
    });

  return parrotRouter;
}

// TODO: GraphQL support

export async function loadParrotMiddleware(app, { scenarios, useParrotMiddleware, publish }) {
  debug('"useParrotMiddleware" was set to "%s"', useParrotMiddleware);

  if (useParrotMiddleware && scenarios.length > 0) {
    debug(`${printParrot()} Loading scenarios %o`, scenarios);
    await time(`${printParrot()} - initializing`, () => {
      const parrotMiddleware = createHotParrotMiddleware(scenarios, publish);
      app.use(parrotMiddleware);
    });
  } else {
    debug(`${printParrot()} Scenarios were not found`);
  }
}
