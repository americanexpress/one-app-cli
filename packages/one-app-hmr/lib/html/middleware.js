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

import fs from 'fs';

import renderDocument from '.';
import { getPublicPath, getExternalsPublicPath, getStaticPath } from '../webpack/utility';
import { log, yellow, green } from '../logs';

export function createLocalModulesFromStats(stats) {
  const modules = Object.keys(stats.assetsByChunkName)
    .map((name) => {
      const cssFile = stats.assetsByChunkName[name].find((pathName) => pathName === `${name}/${name}.css`);
      const jsFile = stats.assetsByChunkName[name].find((pathName) => pathName === `${name}/${name}.js`);
      return {
        name,
        src: jsFile && `/${getPublicPath(jsFile)}`,
        css: cssFile && `/${getPublicPath(cssFile)}`,
      };
    })
    .filter(({ src, css }) => !!src || !!css);

  const localModuleMap = {
    modules: modules.reduce(
      (map, { name, src }) => ({
        ...map,
        [name]: {
          baseUrl: `/${getPublicPath(name)}`,
          browser: {
            url: src,
          },
        },
      }),
      {}
    ),
  };

  return {
    modules,
    localModuleMap,
  };
}

export function createStaticRenderMiddleware({
  entryModule: { rootModuleName },
  remoteModuleMap,
} = {}) {
  const externals = (fs.existsSync(getStaticPath('vendor'))
    ? fs.readdirSync(getStaticPath('vendor')) : [])
    .filter((pathname) => pathname.endsWith('.js'))
    .map((filename) => ({
      src: `/${getExternalsPublicPath(filename)}`,
    }));

  return (req, res) => {
    const stats = res.locals.webpackStats.toJson();
    const { modules, localModuleMap } = createLocalModulesFromStats(stats);
    const moduleMap = {
      ...remoteModuleMap,
      ...localModuleMap,
      modules: {
        ...remoteModuleMap.modules,
        ...localModuleMap.modules,
      },
    };

    if (!modules.find(({ name }) => name === rootModuleName)) {
      const rootModule = moduleMap.modules[rootModuleName];

      if (!rootModule) {
        console.error('[One App HMR]: Root Module not found');
      } else {
        modules.unshift({
          name: rootModuleName,
          src: rootModule.browser.url,
        });
      }
    } else {
      // we need the root module to be the first script
      modules.sort((a) => {
        if (a.name === rootModuleName) {
          return -1;
        }
        return 0;
      });
    }

    const html = renderDocument({
      rootModuleName,
      modules,
      externals,
      moduleMap,
    });

    log(yellow(`Rendered HTML with local modules: [${green(modules.map(({ name }) => name).join(', '))}]`));

    res
      .status(200)
      .type('html')
      .send(
        html
      );
  };
}
