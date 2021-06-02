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

import express from 'express';

import createRenderingMiddleware from './middleware/html';
import requestAcceptedMiddleware from './middleware/request-accepted';
import createMocksMiddleware from './middleware/parrot-scenarios';
import createModulesProxyRelayMiddleware from './middleware/proxy-relay';
import loadWebpackMiddleware from './middleware/webpack';

import { createModuleMap } from './utils/module-map';
import { getPublicUrl, getStaticPath } from './utils/paths';
import { isDevelopment, openBrowser } from './utils/helpers';
import { loadLanguagePacks } from './utils/language-packs';
import { loadStatics } from './utils/statics';
import {
  setLogLevel,
  logHotReloadReady,
  logServerUrl,
  logExternalsBundleAnalyzerUrl,
  logModuleBundlerAnalyzerUrl,
  logServerStart,
  logError,
} from './utils/logs';
import { errorReportingUrlFragment } from './constants';

export function onLaunch({
  openWhenReady, externals = [], serverAddress, port,
}) {
  return (error) => {
    if (error) throw error;
    logServerUrl(serverAddress, port);
    logHotReloadReady();
    logModuleBundlerAnalyzerUrl(serverAddress);
    if (externals.length > 0) {
      logExternalsBundleAnalyzerUrl(serverAddress, externals);
    }

    if (openWhenReady) openBrowser(serverAddress);
  };
}

export default async function holocronDevServer({
  port = 4000,
  serverAddress = `http://localhost:${port}/`,
  logLevel,
  clientConfig,
  openWhenReady,
  externals,
  modules,
  rootModuleName,
  environmentVariables,
  remoteModuleMapUrl,
  dockerImage,
  webpackConfigPath,
  offline,
}) {
  if (!isDevelopment()) {
    logError(
      'Please ensure you are running this in development environment. Check that NODE_ENV="development"'
    );
    // Since this is a CLI tool and only enabled for production build
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
  setLogLevel(logLevel);

  logServerStart({ rootModuleName });

  await loadStatics({ dockerImage, offline });
  await loadLanguagePacks({ modules });

  const { moduleMap, localModuleMap, remoteModuleMap } = await createModuleMap({
    modules,
    remoteModuleMapUrl,
  });
  // TODO: look are re-using one-app-dev-cdn and one-add-dev-proxy
  const proxyRelayMiddleware = createModulesProxyRelayMiddleware({
    moduleMap,
    localModuleMap,
    remoteModuleMap,
  });

  const mockMiddleware = await createMocksMiddleware({
    modules,
    serverAddress,
  });

  const [devMiddleware, hotMiddleware] = await loadWebpackMiddleware({
    modules,
    externals,
    environmentVariables,
    webpackConfigPath,
  });

  const renderMiddleware = createRenderingMiddleware({
    rootModuleName,
    moduleMap,
    modules,
    clientConfig,
  });

  const app = express();

  app
    .post(errorReportingUrlFragment, requestAcceptedMiddleware)
    .use(proxyRelayMiddleware)
    .use(devMiddleware)
    .use(hotMiddleware)
    .use(getPublicUrl(), express.static(getStaticPath()))
    .use(mockMiddleware)
    .get('*', renderMiddleware);

  app.start = () => app.listen(
    port,
    onLaunch({
      port,
      serverAddress,
      openWhenReady,
      externals,
    })
  );

  return app;
}
