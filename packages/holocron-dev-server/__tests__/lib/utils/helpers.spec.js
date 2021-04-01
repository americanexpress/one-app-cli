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

import {
  isDevelopment,
  getLocalRootModule,
  getModuleFromFilePath,
  openBrowser,
} from '../../../src/utils/helpers';

jest.mock('open');

describe('isDevelopment', () => {
  const { NODE_ENV } = process.env;

  beforeEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  test('returns true when NODE_ENV is set to "development"', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevelopment()).toBe(true);
  });

  test('returns false when NODE_ENV is set to "production"', () => {
    process.env.NODE_ENV = 'production';
    expect(isDevelopment()).toBe(false);
  });
});

describe('getLocalRootModule', () => {
  test('accesses and returns a local root module', () => {
    const root = { rootModule: true };
    const modules = [root, { rootModule: false }];
    expect(getLocalRootModule({ modules })).toBe(root);
  });

  test('returns undefined if no local root modules found', () => {
    const modules = [{ rootModule: false }, { rootModule: false }];
    expect(getLocalRootModule({ modules })).toBeUndefined();
  });
});

describe('getModuleFromFilePath', () => {
  test('matches a module from its file path', () => {
    const modulePath = '/path/to/module';
    const filePath = `${modulePath}/browser.js`;
    const match = { modulePath };
    const modules = [match];
    expect(getModuleFromFilePath({ modules, filePath })).toBe(match);
  });

  test('returns undefined if no local modules found', () => {
    const modulePath = '/path/to/module';
    const filePath = `${modulePath}/browser.js`;
    const modules = [{ modulePath: '/another/path' }, { modulePath: '/path/to/other/module' }];
    expect(getModuleFromFilePath({ modules, filePath })).toBeUndefined();
  });
});

describe('openBrowser', () => {
  const open = require('open');

  test('opens the default browser ', () => {
    const url = 'https://localhost:4000';
    expect(openBrowser(url)).toBeUndefined();
    expect(open).toHaveBeenCalledWith(url);
  });
});
