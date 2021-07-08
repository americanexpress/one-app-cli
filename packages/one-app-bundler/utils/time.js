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

const chalk = require('chalk');
const { performance } = require('perf_hooks');

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function getDurationInSeconds(milliseconds, rounding) {
  const seconds = milliseconds / 1000;
  return Math.round(seconds * rounding) / rounding;
}

function printTimeDuration(name, durationInMilliseconds) {
  // rounding to the first two decimal places
  const seconds = getDurationInSeconds(durationInMilliseconds, 100);
  console.log(
    '\n[one-app-bundler]: %s took %s seconds to complete.\n',
    chalk.bold.green(name),
    chalk
      // start at green (120) and stop at red (0)
      // the longer a build takes the hotter the printed color
      // will be - a minute build should be printed yellow-orange
      .hsl(120 - clamp(seconds * 3, 0, 120), 100, 50)
      .bold(seconds)
  );
}

module.exports = async function time(asyncCallback, buildName = 'Module') {
  const now = performance.now();
  await asyncCallback();
  const timeToComplete = performance.now() - now;
  printTimeDuration(buildName, timeToComplete);
  return timeToComplete;
};
