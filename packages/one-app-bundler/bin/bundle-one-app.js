#! /usr/bin/env node
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

const postProcessOneAppBundle = require('./postProcessOneAppBundle');
const createClientConfig = require('../webpack/app/webpack.client');
const buildWebpack = require('../utils/buildWebpack');
const time = require('../utils/time');

time(() => {
  const configs = [
    ['browser', createClientConfig('modern')],
    ['legacyBrowser', createClientConfig('legacy')],
  ].map(([name, config]) => ({
    ...config,
    name,
  }));

  return buildWebpack(configs, { isModuleBuild: false })
    .then(postProcessOneAppBundle)
    .catch((err) => {
      console.error(chalk.red(err), chalk.red(err.stack));
    });
}, 'One App');
