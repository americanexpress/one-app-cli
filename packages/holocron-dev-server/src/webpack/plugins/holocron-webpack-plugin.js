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

import path from 'path';
import { getModuleFromFilePath } from '../../utils/helpers';

import { getWebpackVersion } from '../helpers';

export const loaderPath = path.join(__dirname, 'holocron-webpack-loader.js');

// TODO: better regexp to match module entry point,
// or look at compilation "module" from loader hook to identify if entry point
// (excluding entries from node_modules and exclusive to module entries)
export const moduleEntryRegExp = /\/src\/index\.js$/;
export default class HolocronModulePlugin {
  constructor(options = {}) {
    this.options = options;
  }

  loaderHook(context, module) {
    const filePath = module.userRequest;
    const { modules, externals, hot } = this.options;
    if (moduleEntryRegExp.test(filePath)) {
      const localModule = getModuleFromFilePath({ modules, filePath });
      if (localModule) {
        const { rootModule, moduleName } = localModule;
        module.loaders.push({
          loader: loaderPath,
          options: {
            hot,
            externals,
            moduleName,
            rootModule,
          },
        });
      }
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
      // eslint-disable-next-line default-case
      switch (getWebpackVersion()) {
        case 4: {
          compilation.hooks.normalModuleLoader.tap(
            this.constructor.name,
            this.loaderHook.bind(this)
          );
          break;
        }
        case 5: {
          // eslint-disable-next-line global-require
          const { NormalModule } = require('webpack');
          NormalModule.getCompilationHooks(compilation).loader.tap(
            this.constructor.name,
            this.loaderHook.bind(this)
          );
          break;
        }
      }
    });
  }
}
