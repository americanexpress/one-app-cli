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

import webpack from 'webpack';

import { createHolocronModuleWebpackConfig, createExternalsDllWebpackConfig } from './configs';
import { modulesLibraryVarName } from './helpers';
import { ufs } from '../utils';
import {
  error,
  logWebpackStatsWhenDone,
  logWhenWebpackInvalid,
  logExternalsBuilding,
} from '../utils/logs';

export function runWebpackCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        error(err);
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

export function buildWebpackConfig(config) {
  return runWebpackCompiler(webpack(config));
}

export function buildModuleExternalsDllBundle(config = {}) {
  const { externals: externalsToPackageDll = [], name } = config;

  if (!(externalsToPackageDll.length > 0)) return Promise.resolve();

  return buildWebpackConfig(
    createExternalsDllWebpackConfig({
      name,
      entries: externalsToPackageDll,
    })
  ).then((stats) => {
    logExternalsBuilding(externalsToPackageDll);
    return stats;
  });
}

export function createHotHolocronCompiler({
  modules,
  externals,
  environmentVariables,
  babelConfig,
  webpackConfigPath,
}) {
  const holocronWebpackConfig = createHolocronModuleWebpackConfig({
    hot: true,
    modules,
    externals,
    environmentVariables,
    babelConfig,
    webpackConfigPath,
  });
  const compiler = webpack(holocronWebpackConfig);
  compiler.inputFileSystem = ufs;
  compiler.resolvers.normal.fileSystem = compiler.inputFileSystem;
  compiler.resolvers.context.fileSystem = compiler.inputFileSystem;
  compiler.hooks.done.tap(modulesLibraryVarName, logWebpackStatsWhenDone);
  compiler.hooks.invalid.tap(modulesLibraryVarName, logWhenWebpackInvalid);
  return compiler;
}
