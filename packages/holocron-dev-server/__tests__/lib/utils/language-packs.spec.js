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

import jsonParse from 'json-parse-context';

import {
  writeModuleLanguagePacksToVolume,
  addModuleLanguagePackToVolume,
  extractLanguageDataFromLocale,
  loadModuleLanguagePacks,
  removeModuleLanguagePackFromVolume,
  loadLanguagePacks,
} from '../../../lib/utils/language-packs';

import { createLanguagePackWatcher } from '../../../lib/utils/watcher';
import { vol, ufs } from '../../../lib/utils/virtual-file-system';

jest.mock('../../../lib/utils/watcher');
jest.mock('../../../lib/utils/virtual-file-system', () => ({
  ufs: {
    statSync: jest.fn(() => ({ isDirectory: jest.fn(), isFile: jest.fn() })),
    existsSync: jest.fn(() => false),
    rmdirSync: jest.fn(() => 'test'),
    writeFileSync: jest.fn(() => 'test'),
  },
  vol: {
    fromJSON: jest.fn(),
    unlinkSync: jest.fn().mockImplementationOnce(() => 'test'),
    rmdirSync: jest.fn(() => 'test'),
    writeFileSync: jest.fn(() => 'test'),
  },
}));
jest.mock('../../../lib/utils/paths', () => ({
  getModulesPath: jest.fn(() => '/sample-module'),
  getLocalesPathForModule: jest.fn((pathName) => `${pathName}/locale`),
}));

jest.mock('path');
jest.mock('../../../lib/utils/logs/messages', () => ({
  logWebpackStatsWhenDone: jest.fn(),
  logModuleLanguagePacksLoaded: jest.fn(),
}));
jest.mock('json-parse-context', () => jest.fn(() => ({ title: 'this is the US localization' })));

const isDirectory = jest.fn(() => false);
const isFile = jest.fn(() => true);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation((str) => str);
  ufs.statSync = jest.fn(() => ({ isDirectory, isFile, mtime: 342345 }));
  ufs.readFileSync = jest.fn(() => ({ toString: jest.fn() }));
  ufs.readdirSync = jest.fn(() => []);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('extract language packs', () => {
  beforeEach(() => {
    ufs.readFileSync.mockReturnValue(JSON.stringify({ value: 'test' }));
  });

  test('extracts language pack from locale', () => {
    jest.spyOn(ufs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    }));
    expect(extractLanguageDataFromLocale('sample-module/locale')).toMatchObject({
      title: 'this is the US localization',
    });
  });
  test('returns null if extracting locale is not directory or file', () => {
    jest.spyOn(ufs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => false,
    }));
    expect(extractLanguageDataFromLocale('sample-module/locale')).toBeNull();
  });
  test('extracts language pack from locale in a Directory', () => {
    jest
      .spyOn(ufs, 'statSync')
      .mockImplementationOnce(() => ({
        isDirectory: () => true,
        isFile: () => false,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }));

    expect(extractLanguageDataFromLocale('sample-module/locale')).toMatchObject({ links: {} });
  });
  test('extracts language pack from locale in a Directory with default links', () => {
    const greeting = 'hello';
    jest
      .spyOn(ufs, 'statSync')
      .mockImplementationOnce(() => ({
        isDirectory: () => true,
        isFile: () => false,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }));

    jsonParse.mockImplementationOnce(() => ({ greeting }));
    jsonParse.mockImplementationOnce(() => '');
    expect(extractLanguageDataFromLocale('sample-module/locale')).toMatchObject({
      greeting,
      links: {},
    });
  });
});

describe('loadModuleLanguagePacks', () => {
  test('return empty array if language pack doesnt exists', () => {
    expect(loadModuleLanguagePacks('sample-module')).toEqual([]);
  });
});

describe('writeModuleLanguagePacksToVolume', () => {
  test('add LanguagePacks For Module', () => {
    ufs.existsSync = jest.fn(() => true);
    ufs.readdirSync = jest.fn(() => ['en-US']);
    jest
      .spyOn(ufs, 'statSync')
      .mockImplementationOnce(() => ({
        isDirectory: () => true,
        isFile: () => false,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }));
    expect(
      writeModuleLanguagePacksToVolume({ modulePath: 'sample-module', moduleName: 'sample-module' })
    ).toMatchObject(['en-us']);
    expect(
      writeModuleLanguagePacksToVolume({
        modulePath: 'sample-module',
        moduleName: 'sample-module',
        localePath: '/locale',
      })
    ).toMatchObject(['en-us']);
  });
});

describe('addModuleLanguagePackToVolume', () => {
  test('add module language pack', () => {
    jest
      .spyOn(ufs, 'statSync')
      .mockImplementationOnce(() => ({
        isDirectory: () => true,
        isFile: () => false,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }))
      .mockImplementationOnce(() => ({
        isDirectory: () => false,
        isFile: () => true,
      }));
    expect(() => {
      addModuleLanguagePackToVolume({
        moduleName: 'sample-module',
        filePath: '/sample-module',
        locale: 'en-US',
      });
    }).not.toThrow();
    expect(vol.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe('remove module Language Pack', () => {
  removeModuleLanguagePackFromVolume({
    moduleName: 'sample-module',
    locale: 'en-US',
  });
  expect(vol.unlinkSync).toHaveBeenCalledTimes(1);
  expect(vol.rmdirSync).toHaveBeenCalledTimes(1);
});

describe('loadLanguagePacks', () => {
  test('resolves to undefined if no module contained a "<modulePath>/locale" to the language packs', async () => {
    await expect(loadLanguagePacks()).resolves.toBe(undefined);
  });

  test('resolves to watcher if language packs were found at "<modulePath>/locale"', async () => {
    const moduleName = 'my-module';
    const modulePath = `path/to/${moduleName}`;
    const modules = [{ modulePath }];
    const watcher = {};
    ufs.existsSync.mockImplementationOnce(() => true);
    createLanguagePackWatcher.mockImplementationOnce(() => Promise.resolve(watcher));
    await expect(loadLanguagePacks({ modules })).resolves.toBe(watcher);
    expect(createLanguagePackWatcher).toHaveBeenCalledTimes(1);
  });
});