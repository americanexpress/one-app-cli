#! /usr/bin/env node

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

const path = require('path');
const fs = require('fs-extra');

const createFromBaseTemplate = require('./create-from-base-template');

const safeToCreateModule = (modulePath) => fs.readdirSync(modulePath).length === 0;

const createHolocronModule = async (opts) => {
  const {
    moduleName,
    template,
  } = opts;
  const modulePath = path.resolve(moduleName);

  fs.ensureDirSync(modulePath);
  if (!safeToCreateModule(modulePath)) { throw new Error(`"${moduleName}" directory must be empty to create a module`); }

  // process.chdir(modulePath);

  if (template) {
    console.warn('Custom templates are not yet supported, using default');
  } else {
    await createFromBaseTemplate({ modulePath });
  }
  // run post clone transforms
};

module.exports = createHolocronModule;
