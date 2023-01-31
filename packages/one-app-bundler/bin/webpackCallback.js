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

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const generateIntegrityManifest = require('./generateIntegrityManifest');

module.exports = function getWebpackCallback(label, isModuleBuild) {
  if (typeof label !== 'string' || !label) {
    throw new Error('`getWebpackCallback` requires a label for its metadata files.');
  }
  return function webpackCallback(err, stats) {
    if (err) {
      console.log(chalk.red(err), chalk.red(err.stack));
      throw err;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      jsonStats.errors.forEach((e) => {
        console.log(chalk.red(e), chalk.red(e.stack));
      });
      process.exitCode = 1;
    }

    if (jsonStats.warnings.length > 0) {
      jsonStats.warnings.forEach((w) => {
        console.log(chalk.yellow(w, w.stack));
      });
    }

    fs.writeFileSync(path.join(process.cwd(), `.webpack-stats.${label}.json`), JSON.stringify(jsonStats));

    if (isModuleBuild) {
      generateIntegrityManifest(
        label,
        path.join(stats.compilation.compiler.outputPath, stats.compilation.outputOptions.filename)
      );
    }

    if (process.argv.indexOf('--watch') !== -1) {
      return;
    }

    // for CI/CD have webpack exit if a module isn't found (should be default behavior but isn't)
    if (stats.compilation.errors[0]) {
      throw stats.compilation.errors[0];
    }
  };
};
