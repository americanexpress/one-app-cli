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
import { createHotModuleRenderingMiddleware } from './html/middleware';
import { loadParrotMiddleware } from './parrot';
import { loadLanguagePacks } from './locale';
import {
  info, warn, yellow, orange,
} from './logs';

export const acceptedMiddleware = (req, res) => {
  res.status(202);
};

export default async function hmrServer({
  port = 4000,
  context,
  publicPath,
  staticPath,
  rootModuleName,
  remoteModuleMap,
  modules,
  externals,
  scenarios,
  languagePacks,
  useParrotMiddleware,
  useLanguagePacks,
} = {}) {
  info('Starting HMR server');
  info(`Root Holocron module: ${orange(rootModuleName)}`);
  info(`Holocron modules loaded: ${modules.map(({ moduleName }) => orange(`"${moduleName}"`)).join(', ')}`);

  const serverAddress = `http://localhost:${port}/`;
  const {
    publish,
    devMiddleware,
    hotMiddleware,
  } = await loadWebpackMiddleware({
    context,
    publicPath,
    staticPath,
    modules,
    externals,
    rootModuleName,
  });

  devMiddleware.waitUntilValid(() => {
    info(`${orange('🔥 HMR server is ready')} - visit "${yellow(serverAddress)}" to start!\n`);
  });

  const app = express();

  app
    .use(devMiddleware)
    .use(hotMiddleware)
    .use('/static', express.static(getStaticPath()));

  await loadLanguagePacks(app, { languagePacks, useLanguagePacks, publish });
  await loadParrotMiddleware(app, { scenarios, useParrotMiddleware, publish });

  const renderMiddleware = await createHotModuleRenderingMiddleware({
    rootModuleName,
    remoteModuleMap,
    errorReportingUrl: '/error',
  });

  app
    .get('*', renderMiddleware)
    .post('/error', acceptedMiddleware);

  return [app, app.listen(port, (error) => {
    if (error) throw error;
    info(`HMR server is up on "${serverAddress}" - ${yellow('initializing HMR')}`);

    process.on('exit', () => {
      warn('HMR server shutting down');
    });
  })];
}
