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
import parrot from 'parrot-middleware';

import createMocksMiddleware, {
  getMocksFromModules,
  loadScenarios,
  createMockRouter,
  createWatchEventHandler,
} from '../../../src/middleware/parrot-scenarios';
import {
  getScenarioPathForModule, getMockDirectoryForModule,
} from '../../../src/utils/paths';
import { publish } from '../../../src/utils/publish';
import { watchFiles } from '../../../src/utils/watcher';
import { logError, logMockAction, logScenariosRegistered } from '../../../src/utils/logs';

jest.mock('parrot-middleware');
jest.mock('../../../src/utils/logs');
jest.mock('../../../src/utils/helpers', () => ({
  getModuleFromFilePath: jest.fn((s) => s),
}));
jest.mock('../../../src/utils/virtual-file-system', () => ({
  ufs: {
    existsSync: jest.fn(() => true),
  },
}));
jest.mock('../../../src/utils/publish', () => ({
  publish: jest.fn(),
}));
jest.mock('../../../src/utils/watcher', () => ({
  watchFiles: jest.fn(),
}));
jest.mock('../../../src/utils/paths', () => ({
  joinUrlFragments: jest.fn((...args) => args.join('')),
  getScenarioPathForModule: jest.fn((s) => `${s}/__mocks__/scenario.js`),
  getMockDirectoryForModule: jest.fn((s) => `${s}/__mocks__`),
}));

const mocksDir = path.resolve(__dirname, '../../../__mocks__');
const modulePath = path.resolve(__dirname, '../../..');
const scenariosPath = require.resolve('../../../__mocks__/scenario');
const watcher = {};
watcher.on = jest.fn(() => watcher);
watcher.getWatched = jest.fn(() => ({ [mocksDir]: ['scenario.js'] }));
const { on, getWatched } = watcher;
beforeAll(() => {
  parrot.mockImplementation(() => jest.fn());
  watchFiles.mockImplementation(() => watcher);
  getScenarioPathForModule.mockImplementation(() => scenariosPath);
  getMockDirectoryForModule.mockImplementation(() => mocksDir);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadScenarios', () => {
  test('requires the scenario paths to return result', () => {
    expect(loadScenarios()).toEqual({});
    expect(loadScenarios([scenariosPath])).toEqual(require('../../../__mocks__/scenario'));
  });

  test('loads empty scenario without failing', () => {
    const scenarioEmptyPath = scenariosPath.replace('scenario', 'empty-scenarios');
    getScenarioPathForModule.mockImplementationOnce(() => scenarioEmptyPath);
    expect(loadScenarios([scenarioEmptyPath])).toEqual({});
  });
});

describe('getMocksFromModules', () => {
  test('requires the scenario paths to return result', () => {
    const modules = [
      {
        modulePath,
      },
    ];
    expect(getMocksFromModules()).toEqual([[], []]);
    expect(getMocksFromModules(modules)).toEqual([[mocksDir], [scenariosPath]]);
  });
});

describe('createMockRouter', () => {
  test('returns an express router with added properties', () => {
    const router = createMockRouter();
    expect(router.loadScenarios).toBeInstanceOf(Function);
    expect(router.reload).toBeInstanceOf(Function);
    expect(router.reset).toBeInstanceOf(Function);
    expect(router.get).toBeInstanceOf(Function);
    expect(router.use).toBeInstanceOf(Function);
    expect(router.stack).toBeInstanceOf(Array);
  });

  test('resets the router stack', () => {
    const router = createMockRouter();

    router.use((_, __, next) => next());

    expect(router.stack.length).toEqual(1);
    expect(router.reset()).toBeUndefined();
    expect(router.stack.length).toEqual(0);
  });

  test('can reload new scenarios into the router', () => {
    const scenarios = {};
    const router = createMockRouter();

    expect(router.reload(scenarios)).toBeUndefined();
    expect(parrot).toHaveBeenCalledWith(scenarios);
  });

  test('catches any errors when loading scenarios', () => {
    const scenarios = {};
    const router = createMockRouter();

    parrot.mockImplementationOnce(() => {
      throw new Error('error');
    });
    expect(() => router.loadScenarios(scenarios)).not.toThrow();
    expect(parrot).toHaveBeenCalledWith(scenarios);
    expect(logError).toHaveBeenCalled();
  });
});

describe('createWatchEventHandler', () => {
  test('returns a function to handle watch events', () => {
    expect(createWatchEventHandler()).toBeInstanceOf(Function);
  });

  test('calls the handler while logging and publishing updates', () => {
    const filePath = '/some/absolute/path/to/a/module/mock/scenario';
    const ctx = {};
    const fn = jest.fn();
    const handle = createWatchEventHandler(ctx, fn);
    expect(handle).toBeInstanceOf(Function);
    expect(handle(filePath)).toBeUndefined();
    expect(publish).toHaveBeenCalled();
    expect(logMockAction).toHaveBeenCalled();
  });
});

describe('createMocksMiddleware', () => {
  test('returns no op middleware when no scenarios found', async () => {
    const next = jest.fn();
    const noop = await createMocksMiddleware();
    expect(on).not.toHaveBeenCalled();
    expect(() => noop(null, null, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  test('mock middleware runs with scenarios present', async () => {
    const serverAddress = 'http://add.ress';
    const modules = [
      {
        modulePath,
      },
    ];
    await createMocksMiddleware({ modules, serverAddress });
    expect(on).toHaveBeenCalledTimes(4);
    expect(getWatched).toHaveBeenCalledTimes(1);
  });

  test('does not throw when importScenarios fails', async () => {
    const serverAddress = 'http://add.ress';
    const modules = [
      {
        modulePath,
      },
    ];
    logScenariosRegistered.mockImplementationOnce(() => {
      throw new Error('error');
    });
    await expect(createMocksMiddleware({ modules, serverAddress })).resolves.toBeDefined();
    expect(on).toHaveBeenCalledTimes(4);
    expect(logError).toHaveBeenCalledTimes(1);
  });
});
