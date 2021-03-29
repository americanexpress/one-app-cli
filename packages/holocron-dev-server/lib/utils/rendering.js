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

import { fromJS } from 'immutable';
import transit from 'transit-immutable-js';
import React from 'react';
import ReactDOM from 'react-dom/server';
import importJsx from 'import-jsx';

import { ufs } from './virtual-file-system';
import {
  createModuleScriptUrl,
  getPublicModulesUrl,
  getPublicVendorsUrl,
  getVendorsPath,
} from './paths';

export function createInitialState({
  lang, rootModuleName, errorReportingUrl, ...config
}) {
  return transit.toJSON(
    fromJS({
      config: {
        ...config,
        reportingUrl: errorReportingUrl,
        cdnUrl: getPublicModulesUrl(),
        rootModuleName,
      },
      intl: {
        activeLocale: lang,
      },
    })
  );
}

export function getEntryScriptsForExternals() {
  const vendorsPath = getVendorsPath();
  return (ufs.existsSync(vendorsPath) ? ufs.readdirSync(vendorsPath) : [])
    .filter((pathname) => pathname.endsWith('.js'))
    .map((fileName) => ({
      src: getPublicVendorsUrl(fileName),
    }));
}

export function getWebpackScriptsForLocalModules({ modules = [], moduleMap, rootModuleName }) {
  const scripts = [...modules];
  // we are creating the script tag info for rendering
  // the root module needs to be the first script, and
  // we need to ensure that order
  // first we check if any of our local modules is a root module
  const rootModule = scripts.find(({ rootModule: isRoot }) => isRoot);
  if (rootModule) {
    // if root module is local, we can sort it to be first
    // by using a bool property "rootModule" set on config
    scripts.sort(({ rootModule: a }, { rootModule: b }) => {
      if (a) return -1;
      if (b) return -1 * Object.keys(moduleMap.modules).length * 2;
      return 0;
    });
  } else {
    // if there is no local root module, the module map is used to
    // set the script as the first module
    scripts.unshift({
      name: rootModuleName,
      src: moduleMap.modules[rootModuleName].browser.url,
    });
  }
  // finally, we need to have the webpack runtime before any local
  // modules, including the root module
  scripts.unshift({
    name: 'runtime',
    src: getPublicModulesUrl(createModuleScriptUrl('runtime')),
  });
  return scripts.map(({ name, src }) => ({ name, src }));
}

export function renderDocument({
  modules,
  moduleMap,
  rootModuleName,
  clientConfig,
  lang = 'en-US',
}) {
  const { default: Document } = importJsx(require.resolve('../components/Document.jsx'));

  return '<!DOCTYPE html>'.concat(
    ReactDOM.renderToStaticMarkup(
      React.createElement(Document, {
        lang,
        moduleMap,
        scripts: [].concat(
          getEntryScriptsForExternals(),
          getWebpackScriptsForLocalModules({ modules, moduleMap, rootModuleName })
        ),
        initialState: createInitialState({
          lang,
          rootModuleName,
          ...clientConfig,
        }),
      })
    )
  );
}
