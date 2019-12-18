/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const path = require('path');
const chokidar = require('chokidar');
const compileModuleLocales = require('./src/compileModuleLocales');

function runLocaleBundler(modulePath) {
  return compileModuleLocales(modulePath)
    .catch((err) => {
      setTimeout(() => { throw err; });
    });
}

module.exports = function localeBundler(watch) {
  const modulePath = process.cwd();

  runLocaleBundler(modulePath);

  if (watch) {
    const inputPath = path.join(modulePath, 'locale');
    chokidar
      .watch(inputPath, { ignoreInitial: true })
      .on('all', () => runLocaleBundler(modulePath));
  }
};
