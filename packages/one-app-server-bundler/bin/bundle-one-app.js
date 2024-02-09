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

const { promisify } = require('util');
const webpack = promisify(require('webpack'));
const chalk = require('chalk');

const config = require('../webpack/app/webpack.client');
const getWebpackCallback = require('./webpackCallback');
const postProcessOneAppBundle = require('./postProcessOneAppBundle');

Promise.all([
  webpack(config('modern')).then((stats) => getWebpackCallback('browser', false)(undefined, stats)),
  webpack(config('legacy')).then((stats) => getWebpackCallback('legacyBrowser', false)(undefined, stats)),
]).then(postProcessOneAppBundle).catch((err) => {
  console.log(chalk.red(err), chalk.red(err.stack));
});
