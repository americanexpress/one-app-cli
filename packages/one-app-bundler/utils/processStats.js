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

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const generateIntegrityManifest = require('./generateIntegrityManifest');

const orange = chalk.keyword('orange');

module.exports = function processStats(stats, { watch, isModuleBuild } = {}) {
  const jsonStats = stats.toJson();

  if (stats.hasErrors()) {
    const errorMessages = jsonStats.errors.map((e) => [chalk.red(e), chalk.red(e.stack)].join('\n')).join('\n');
    console.error(chalk.bold.red(`\n[one-app-bundler]: error - "${stats.compilation.name}":\n`), orange(errorMessages));
    process.exitCode = 1;
    return;
  }

  if (stats.hasWarnings()) {
    const warningMessages = jsonStats.warnings.join('\n');
    console.warn(
      chalk.bgBlack.yellow(
        [orange.bold(`\n[one-app-bundler]: warning - "${stats.compilation.name}":\n`), chalk.yellow(warningMessages)].join('\n')
      )
    );
  }

  fs.writeFileSync(path.join(process.cwd(), `.webpack-stats.${stats.compilation.name}.json`), JSON.stringify(jsonStats));

  if (isModuleBuild) {
    generateIntegrityManifest(
      stats.compilation.name,
      path.join(stats.compilation.compiler.outputPath, stats.compilation.outputOptions.filename)
    );
  }

  if (watch) {
    return;
  }

  // for CI/CD have webpack exit if a module isn't found (should be default behavior but isn't)
  if (stats.compilation.errors[0]) {
    throw stats.compilation.errors[0];
  }
};
