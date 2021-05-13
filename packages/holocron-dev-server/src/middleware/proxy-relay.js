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

import fetch from 'cross-fetch';
import { createTimeoutFetch } from '@americanexpress/fetch-enhancers';
import ProxyAgent from 'proxy-agent';

import { logProxyRequestMatch, logRemoteHasBeenLoadedCached, logError } from '../utils/logs';
import { getContextPath } from '../utils/paths';
import { volume } from '../utils/virtual-file-system';

export function fetchRemoteRequest(remoteUrl) {
  const fetcher = createTimeoutFetch(6e3)(fetch);
  return fetcher(remoteUrl, {
    headers: { connection: 'keep-alive' },
    agent: new ProxyAgent(),
  }).catch((e) => logError(e));
}

export default function createModulesProxyRelayMiddleware({
  moduleMap,
  localModuleMap,
  remoteModuleMap,
}) {
  const moduleMapDictionary = Object.keys(remoteModuleMap.modules)
    .filter((moduleName) => !localModuleMap.modules[moduleName])
    .map((moduleName) => [
      moduleMap.modules[moduleName].baseUrl,
      remoteModuleMap.modules[moduleName].baseUrl
        || remoteModuleMap.modules[moduleName].browser.url.replace(`${moduleName}.browser.js`, ''),
    ]);

  return async function proxyRelayMiddleware(req, res, next) {
    const localFilePath = getContextPath(req.path);
    const remoteModuleMatch = moduleMapDictionary
      .find(([localBasePath]) => req.path.startsWith(localBasePath));

    if (remoteModuleMatch) {
      logProxyRequestMatch(req);
      if (!volume.existsSync(localFilePath)) {
        const [localBasePath, remoteBasePath] = remoteModuleMatch;
        const remoteUrl = req.path.replace(localBasePath, remoteBasePath);
        const response = await fetchRemoteRequest(remoteUrl) || { text: () => '' };
        const text = await response.text();
        volume.fromJSON({
          [localFilePath]: text,
        });
        logRemoteHasBeenLoadedCached(remoteUrl);
      }
    }

    // once added to the virtual file system, webpack dev middleware will handle the request
    return next();
  };
}
