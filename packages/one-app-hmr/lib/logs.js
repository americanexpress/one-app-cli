/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

/* eslint-disable no-console */

import createDebug from 'debug';
import chalk from 'chalk';

export const libName = 'one-app-hmr';

export const debug = createDebug(libName);

let logLevel = 2;
export function setLogLevel(level = 2) {
  logLevel = level;
}

export const {
  red, green, yellow,
} = chalk;
export const pink = chalk.keyword('pink');
export const bisque = chalk.keyword('bisque');
export const deeppink = chalk.keyword('deeppink');
export const dodgerblue = chalk.keyword('dodgerblue');
export const blueviolet = chalk.keyword('blueviolet');
export const palegreen = chalk.keyword('palegreen');
export const purple = chalk.keyword('purple');
export const orange = chalk.keyword('orange');
export const cyan = chalk.keyword('cyan');
export const printLibName = () => `  ${libName} ::`;
export const log = (message) => logLevel > 1 && console.log(`${cyan.bold(printLibName())} %s`, message);
export const warn = (message) => logLevel > 0 && console.warn(`${orange.bold(printLibName())} %s`, orange(message));
export const error = (message) => console.error(`${red.bold(printLibName())} %s`, red(message));
export const info = (message) => console.info(`\n${green.bold(printLibName())} %s`, green(message));
export const time = async (label, callback) => {
  const timeLabel = `${bisque.bold(printLibName())} ${label}`;
  console.time(timeLabel);
  await callback();
  console.timeEnd(timeLabel);
};

export function setDebugMode() {
  process.env.DEBUG = [process.env.DEBUG || '', 'one-app-hmr'].join(' ').trim();
}

setDebugMode();
