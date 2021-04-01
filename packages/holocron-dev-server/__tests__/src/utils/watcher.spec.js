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

import chokidar from 'chokidar';

import {
  watchFiles,
  createLanguagePackWatchEventHandler,
  createLanguagePackWatcher,
} from '../../../src/utils';

jest.mock('chokidar');
jest.mock('../../../src/utils/logs/messages', () => ({
  logWebpackStatsWhenDone: jest.fn(),
  logModuleLanguagePacksLoaded: jest.fn(),
  logLocaleAction: jest.fn(),
  logLocaleModuleNamesBeingWatched: jest.fn(),
}));
const watcher = {};
const on = jest.fn((eventName, callback) => {
  if (eventName === 'ready') callback();
  return watcher;
});
watcher.on = on;

const moduleName = 'my-module';
const modulePath = 'path/to/my-module';
const moduleType = { modulePath, moduleName };
const defaultModules = [moduleType];

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation((str) => str);
  chokidar.watch.mockImplementation(() => watcher);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('watchFiles', () => {
  test('creates watcher promise that resolves when watcher is ready', async () => {
    await expect(watchFiles()).resolves.toBe(watcher);
    expect(on).toHaveBeenCalledTimes(2);
  });

  test('rejects when a watch error occurs before watcher is ready', async () => {
    on.mockImplementationOnce((eventName, callback) => {
      if (eventName === 'error') callback('watch-error');
    });
    await expect(watchFiles()).rejects.toEqual('watch-error');
    expect(on).toHaveBeenCalledTimes(1);
  });
});

describe('createLanguagePackWatchEventHandler', () => {
  const filePath = '/mock/scenarios.js';
  const label = 'mock:add';
  const action = 'add';
  const context = { label, action };
  test('creates watcher promise that resolves when watcher is ready', async () => {
    const operation = jest.fn();
    const callback = createLanguagePackWatchEventHandler(context, operation);
    await expect(callback(filePath)).toBe(undefined);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('createLanguagePackWatcher', () => {
  test('creates watcher for module language packs and syncs to file changes', async () => {
    await expect(createLanguagePackWatcher()).resolves.toBe(watcher);
    expect(on).toHaveBeenCalledTimes(6);
  });

  test('watches default modules', async () => {
    const modules = [...defaultModules];
    await expect(createLanguagePackWatcher({ modules })).resolves.toBe(watcher);
    expect(on).toHaveBeenCalledTimes(6);
  });
});
