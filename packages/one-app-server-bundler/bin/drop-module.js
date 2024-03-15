#! /usr/bin/env node
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

const util = require('node:util');
const fs = require('node:fs');
const path = require('node:path');

const publicPath = path.join(process.cwd(), 'static');
const symModulesPath = path.join(publicPath, 'modules');
const moduleMapPath = path.join(publicPath, 'module-map.json');

util.parseArgs({ allowPositionals: true }).positionals.forEach((moduleName) => {
  try {
    fs.accessSync(moduleMapPath);
  } catch (e) {
    throw new Error('No modules are currently being served');
  }

  const moduleMap = JSON.parse(fs.readFileSync(moduleMapPath));
  delete moduleMap.modules[moduleName];
  fs.writeFileSync(moduleMapPath, JSON.stringify(moduleMap));

  const modulePath = path.join(symModulesPath, moduleName);

  fs.rmSync(modulePath, { recursive: true, force: true });
});
