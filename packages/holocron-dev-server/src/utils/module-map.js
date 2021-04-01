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

import { createModuleScriptUrl, getPublicModulesUrl, getStaticPath } from './paths';
import {
  debug,
  logLocalModulesLoaded,
  logRemoteModulesLoaded,
  errorOnRemoteModuleMapResponse,
  errorOnRemoteModuleMapFetching,
} from './logs';
import { bundleType as defaultBundleType } from '../constants';
import { volume } from './virtual-file-system';

export async function loadRemoteModuleMap(remoteModuleMapUrl) {
  const fetcher = createTimeoutFetch(6e3)(fetch);
  if (remoteModuleMapUrl) {
    try {
      const response = await fetcher(remoteModuleMapUrl);
      if (response.ok) {
        return response.json();
      }
      errorOnRemoteModuleMapResponse();
    } catch (e) {
      errorOnRemoteModuleMapFetching(e);
    }
  }

  return {
    modules: {},
  };
}

export function createLocalModuleMap(modules = [], bundleType) {
  return {
    modules: modules.reduce((map, { moduleName }) => {
      const baseUrl = getPublicModulesUrl(moduleName);
      return {
        ...map,
        [moduleName]: {
          baseUrl: `${baseUrl}/`,
          [bundleType || defaultBundleType]: {
            // TODO: only works with "browser", "node" for path name..
            // not "legacyBrowser" - "..legacy.browser.js"
            url: getPublicModulesUrl(createModuleScriptUrl(moduleName, bundleType)),
          },
        },
      };
    }, {}),
  };
}

export function createUnifiedModuleMap({ localModuleMap, remoteModuleMap, bundleType }) {
  const localModuleKeys = Object.keys(localModuleMap.modules);
  const remoteModules = Object.keys(remoteModuleMap.modules)
    .filter((moduleName) => !localModuleKeys.includes(moduleName))
    .map((moduleName) => ({ moduleName }));
  const localizedRemoteModuleMap = createLocalModuleMap(remoteModules, bundleType);
  return {
    modules: {
      ...localizedRemoteModuleMap.modules,
      ...localModuleMap.modules,
    },
  };
}

export async function createModuleMap({
  modules,
  remoteModuleMapUrl,
  bundleType = defaultBundleType,
}) {
  const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
  const localModuleMap = createLocalModuleMap(modules);
  const moduleMap = createUnifiedModuleMap({
    localModuleMap,
    remoteModuleMap,
    bundleType,
  });

  const localModuleNames = Object.keys(localModuleMap.modules);
  const remoteModuleNames = Object.keys(remoteModuleMap.modules);
  // TODO: log module count, stats
  logLocalModulesLoaded(localModuleNames);
  logRemoteModulesLoaded(remoteModuleNames, localModuleNames);

  // add it to vfs to be be served by dev middleware
  volume.fromJSON(
    {
      'module-map.json': JSON.stringify(moduleMap, null, 2),
      'local-module-map.json': JSON.stringify(localModuleMap, null, 2),
      'remote-module-map.json': JSON.stringify(remoteModuleMap, null, 2),
    },
    getStaticPath()
  );

  debug('module map %o', moduleMap);

  return {
    remoteModuleMap,
    localModuleMap,
    moduleMap,
  };
}
