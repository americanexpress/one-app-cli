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

import { loadWebpackMiddleware } from './webpack';
import { getStaticPath } from './webpack/utility';
import { createStaticRenderMiddleware } from './html/middleware';
import { loadParrotMiddleware } from './parrot';
import { loadLanguagePacks } from './locale';
import { info, yellow, orange } from './logs';

export default function hmrServer({
  port = 4000,
  modules,
  entryModule,
  remoteModuleMap,
  externals,
  scenarios,
  languagePacks,
  useParrotMiddleware,
  useLanguagePacks,
} = {}) {
  info('Starting HMR server');
  info(`Root Holocron module: ${orange(entryModule.rootModuleName)}`);
  info(`Holocron modules loaded: ${modules.map(({ moduleName }) => orange(`"${moduleName}"`)).join(', ')}`);

  const serverAddress = `http://localhost:${port}/`;
  const {
    devMiddleware,
    hotMiddleware,
  } = loadWebpackMiddleware({ modules, externals, entryModule });

  devMiddleware.waitUntilValid(() => {
    info(`${orange('HMR server is ready')} - visit "${yellow(serverAddress)}" to start!\n`);
  });

  const app = express();

  app
    .use(devMiddleware)
    .use(hotMiddleware)
    .use('/static', express.static(getStaticPath()));

  loadLanguagePacks(app, { languagePacks, useLanguagePacks, hotMiddleware });
  loadParrotMiddleware(app, { scenarios, useParrotMiddleware, hotMiddleware });

  app
    .get(
      '*',
      createStaticRenderMiddleware({
        entryModule,
        remoteModuleMap,
      })
    )
    .post('/error', (req, res) => {
      res.status(202);
    });

  return [app, app.listen(port, (error) => {
    if (error) throw error;
    info(`HMR server is up on "${serverAddress}" - ${yellow('initializing HMR')}`);
  })];
}
