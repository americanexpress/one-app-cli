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

import path from 'path';

import { modulesBundleName } from '../constants';

export const STATIC_DIR = 'static';
export const ONE_APP_DIR = 'app';
export const MODULES_DIR = 'modules';
export const EXTERNAL_DIR = 'vendor';
export const TEMP_DIR = '.temp';

// file paths that are primarily used to place all build assets

export function getContextPath(filePath = '') {
  return path.join(process.cwd(), filePath);
}

export function getStaticPath(filePath = '', context) {
  return path.join(context || getContextPath(), STATIC_DIR, filePath);
}

export function getModulesPath(filePath = '', context) {
  return path.join(context || getContextPath(), STATIC_DIR, MODULES_DIR, filePath);
}

export function getOneAppPath(filePath = '', context) {
  return path.join(context || getContextPath(), STATIC_DIR, ONE_APP_DIR, filePath);
}

export function getVendorsPath(filePath = '', context) {
  return path.join(context || getContextPath(), STATIC_DIR, EXTERNAL_DIR, filePath);
}

export function getTempPath(filePath = '', context) {
  return path.join(context || getContextPath(), STATIC_DIR, TEMP_DIR, filePath);
}

export function getMockDirectoryForModule(modulePath = getContextPath()) {
  return path.join(modulePath, 'mock');
}

export function getScenarioPathForModule(modulePath = getContextPath()) {
  return path.join(modulePath, 'mock', 'scenarios.js');
}

export function getLocalesPathForModule(modulePath = getContextPath()) {
  return path.join(modulePath, 'locale');
}

// URLs relatively formatted to the development server

export function combineUrlFragments(...args) {
  return [].concat(args).join('/');
}

export function joinUrlFragments(...args) {
  return []
    .concat(args)
    .map((pathName) => pathName.replace(/^\//, '').replace(/\/$/, ''))
    .filter((pathName) => !!pathName)
    .join('/');
}

export function getPublicUrl(filePath = '') {
  return `/${combineUrlFragments(...[STATIC_DIR].concat(filePath || []))}`;
}

export function getPublicModulesUrl(moduleName) {
  return `/${combineUrlFragments(STATIC_DIR, MODULES_DIR, moduleName || [])}`;
}

export function getPublicAppUrl(appPath) {
  return `/${combineUrlFragments(STATIC_DIR, ONE_APP_DIR, appPath || [])}`;
}

export function getPublicVendorsUrl(resource) {
  return `/${combineUrlFragments(STATIC_DIR, EXTERNAL_DIR, resource || [])}`;
}

export function createModuleScriptUrl(moduleName, bundleType, version) {
  return joinUrlFragments(
    version ? [moduleName, version].join('/') : moduleName,
    `${bundleType ? [moduleName, bundleType].join('.') : moduleName}.js`
  );
}

// file names

export function getReportFilename(name = modulesBundleName) {
  return `${name}-report.html`;
}
