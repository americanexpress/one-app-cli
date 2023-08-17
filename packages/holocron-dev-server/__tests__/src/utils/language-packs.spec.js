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

import path from 'node:path';
import {
  loadLanguagePacks,
  loadModuleLanguagePack,
  loadModuleLanguagePacks,
  writeModuleLanguagePacksToVolume,
  addModuleLanguagePackToVolume,
  removeModuleLanguagePackFromVolume,
} from '../../../src/utils/language-packs';

import { createLanguagePackWatcher } from '../../../src/utils/watcher';
import { volume, ufs } from '../../../src/utils/virtual-file-system';

jest.mock('../../../src/utils/watcher');
jest.mock('../../../src/utils/virtual-file-system', () => ({
  ufs: {
    statSync: jest.fn(() => ({ isDirectory: jest.fn(), isFile: jest.fn() })),
    existsSync: jest.fn(() => false),
    rmdirSync: jest.fn(() => 'test'),
    writeFileSync: jest.fn(() => 'test'),
  },
  volume: {
    fromJSON: jest.fn(),
    unlinkSync: jest.fn().mockImplementationOnce(() => 'test'),
    rmdirSync: jest.fn(() => 'test'),
    writeFileSync: jest.fn(() => 'test'),
  },
}));
jest.mock('../../../src/utils/logs/messages', () => ({
  logWebpackStatsWhenDone: jest.fn(),
  logModuleLanguagePacksLoaded: jest.fn(),
}));
jest.mock('json-parse-context', () => jest.fn(() => ({ title: 'this is the US localization' })));

const isDirectory = jest.fn(() => false);
const isFile = jest.fn(() => true);
const existsSync = jest.fn(() => true);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation((str) => str);
  ufs.statSync = jest.fn(() => ({ isDirectory, isFile, mtime: 342345 }));
  ufs.readFileSync = jest.fn(() => ({ toString: jest.fn() }));
  ufs.readdirSync = jest.fn(() => []);
  ufs.existsSync = existsSync;
  path.sep = '/';
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('loadModuleLanguagePack', () => {
  const locale = 'en-US';
  const moduleName = 'my-module';
  const modulePath = `path/to/${moduleName}`;

  test('does nothing and returns null if no language pack was found for a given locale', () => {
    existsSync.mockImplementationOnce(() => false).mockImplementationOnce(() => false);
    expect(loadModuleLanguagePack({ moduleName, modulePath, locale })).toBe(null);
  });

  test('does not return language pack for a module locale if neither a directory or file', () => {
    isFile.mockImplementationOnce(() => false);
    expect(loadModuleLanguagePack({ moduleName, modulePath, locale })).toBe(null);
  });

  test('returns language pack for a module locale from a file', () => {
    expect(loadModuleLanguagePack({ moduleName, modulePath, locale })).toEqual({ title: 'this is the US localization' });
  });

  test('returns language pack for a module locale from a directory with folder', () => {
    isDirectory.mockImplementationOnce(() => true);
    ufs.readdirSync = jest.fn(() => [
      {
        name: 'books',
        isDirectory: () => true,
      },
      {
        name: 'test',
        isDirectory: () => false,
      },
    ]);
    expect(loadModuleLanguagePack({ moduleName, modulePath, locale })).toEqual({
      books: { title: 'this is the US localization' },
      title: 'this is the US localization',
    });
  });
  test('returns language pack for a module locale from a directory with without folder', () => {
    ufs.readdirSync = jest.fn(() => []);
    isDirectory.mockImplementationOnce(() => true);
    expect(loadModuleLanguagePack({ moduleName, modulePath, locale })).toEqual({
      title: 'this is the US localization',
    });
  });
});

describe('loadModuleLanguagePacks', () => {
  const moduleName = 'sample-module';
  const modulePath = `path/to/${moduleName}`;

  test('return empty array if language pack doesnt exists', () => {
    existsSync.mockImplementationOnce(() => false);
    expect(loadModuleLanguagePacks({ moduleName, modulePath })).toEqual([]);
  });
});

describe('writeModuleLanguagePacksToVolume', () => {
  test('add LanguagePacks For Module', () => {
    ufs.existsSync = jest.fn(() => true);
    ufs.readdirSync = jest.fn()
      .mockImplementationOnce(() => ['en-US'])
      .mockImplementationOnce(() => [{
        name: 'en-US',
        isDirectory: () => true,
      }])
      .mockImplementationOnce(() => ['en-US'])
      .mockImplementationOnce(() => [{
        name: 'en-US',
        isDirectory: () => true,
      }]);
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
        filePath: '/path/to/sample-module/en-US.json',
        locale: 'en-US',
      });
    }).not.toThrow();
    expect(volume.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe('remove module Language Pack', () => {
  it('should remove the module language pack', () => {
    removeModuleLanguagePackFromVolume({
      moduleName: 'sample-module',
      locale: 'en-US',
    });
    expect(volume.unlinkSync).toHaveBeenCalledTimes(1);
    expect(volume.rmdirSync).toHaveBeenCalledTimes(1);
  });
});

describe('loadLanguagePacks', () => {
  test('resolves to undefined if no module contained a "<modulePath>/locale" to the language packs', async () => {
    await expect(loadLanguagePacks()).resolves.toBe(undefined);
  });

  test('resolves to watcher if language packs were found at "<modulePath>/locale"', async () => {
    ufs.readdirSync = jest.fn()
      .mockImplementationOnce(() => ['en-US'])
      .mockImplementationOnce(() => [{
        name: 'en-US',
        isDirectory: () => true,
      }]);
    const moduleName = 'my-module';
    const modulePath = `path/to/${moduleName}`;
    const modules = [{ moduleName, modulePath }];
    const watcher = {};
    createLanguagePackWatcher.mockImplementationOnce(() => Promise.resolve(watcher));
    await expect(loadLanguagePacks({ modules })).resolves.toBe(watcher);
    expect(createLanguagePackWatcher).toHaveBeenCalledTimes(1);
  });
});
