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

import createDebug from 'debug';
import chalk from 'chalk';

import { defaultLogLevel, libraryName } from '../../constants';

export const debug = createDebug(libraryName);
export function setDebugMode() {
  process.env.DEBUG = [process.env.DEBUG || '', libraryName].join(' ').trim();
}

export const levels = ['error', 'warn', 'log', 'info'];

let logLevel = defaultLogLevel;
export function setLogLevel(level = defaultLogLevel) {
  if (typeof level === 'string') {
    logLevel = levels.indexOf(level) + 1;
  } else if (typeof level === 'number') logLevel = level;
}
export function getLogLevel() {
  return logLevel;
}

export const {
  red, green, blue, yellow,
} = chalk;
export const pink = chalk.keyword('pink');
export const bisque = chalk.keyword('bisque');
export const deeppink = chalk.keyword('deeppink');
export const dodgerblue = chalk.keyword('dodgerblue');
export const blueviolet = chalk.keyword('blueviolet');
export const palegreen = chalk.keyword('palegreen');
export const magenta = chalk.keyword('magenta');
export const purple = chalk.keyword('purple');
export const orange = chalk.keyword('orange');
export const cyan = chalk.keyword('cyan');

export const newLine = (message) => `  ${message}`;
export const printLibName = () => newLine(`${green.bold(`[${libraryName}]`)} ::`);
export const info = (message, ...args) => logLevel > 3 && console.info(`\n${printLibName()} ${green(message)}`, ...args);
export const log = (message, ...args) => logLevel > 2 && console.log(`${printLibName()} ${message}`, ...args);
export const warn = (message, ...args) => logLevel > 1
  && console.warn(
    `\n${orange.bold(printLibName())} ${yellow('(Warning)')} ${orange(message)}\n`,
    ...args
  );
export const logError = (message, ...args) => logLevel > 0
  && console.error(`\n${red.bold(printLibName())} ${orange('(Error)')} ${red(message)}\n`, ...args);
