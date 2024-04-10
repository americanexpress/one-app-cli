/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers.js';

import { getExternalLibraryName } from '../../utils/getExternalLibraryName';

export function ExternalRegisterPlugin(externalName, version) {
  this.externalName = externalName;
  this.version = version;
  this.options = {};
}

ExternalRegisterPlugin.prototype.apply = function apply(compiler) {
  const {
    externalName,
    version,
    options,
  } = this;

  compiler.hooks.compilation.tap('ExternalRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('ExternalRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            const source = compilation.assets[file];
            // descend into the source and inject the registration within the iife
            // The last two symbols are always the closing of the iife, then a `;`
            // Therefore, insert the registration immediately before the iife closes
            // eslint-disable-next-line no-underscore-dangle -- webpack
            source._source._children.splice(-2, 0, `;try {
    Holocron.registerExternal({ name: "${externalName}", version: "${version}", module: ${getExternalLibraryName(externalName, version)}});
} catch (err) {
    console.error('ERROR Registring External "${externalName}"', err)
}`);
          });
      });

      callback();
    });
  });
};
