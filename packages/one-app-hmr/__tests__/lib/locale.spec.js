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
import createDebug from 'debug';

import {
  updateModuleBundle, getModuleInfoFromLocalePath, createHotLanguagePacks, loadLanguagePacks,
} from '../../lib/locale';

jest.mock('child_process', () => ({
  execSync: () => 'en-US',
}));

jest.mock('chokidar', () => {
  const mockChokidar = {
    watch: jest.fn(() => mockChokidar),
    on: jest.fn(() => mockChokidar),
  };

  return mockChokidar;
});
jest.mock('../../lib/webpack', () => ({
  loadWebpackMiddleware: async () => ({
    publish: jest.fn(),
  }),
}));
describe('locale build', () => {
  let originalDebugScope;

  beforeEach(() => {
    console.log.mockClear();
    console.warn.mockClear();
    console.time.mockClear();
    originalDebugScope = createDebug.disable();
  });

  afterEach(() => {
    createDebug.enable(originalDebugScope);
  });

  test('update module bundle ', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    updateModuleBundle('locale/en-US');
    expect(spy.mock.calls).toMatchSnapshot();
  });
  test('gets module-name and locale from file path', () => {
    expect(getModuleInfoFromLocalePath('sample-module/locale/en-US.json')).toEqual(['sample-module', 'en-us']);
  });
  describe('hot reload language-packs', () => {
    const modules = ['sample-module-1', 'sample-module-2'];
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
    const publish = jest.fn();
    test('on error log the error', async () => {
      await createHotLanguagePacks(modules, publish);
      chokidar.on.mock.calls[0][1]();
      expect(consoleWarnSpy.mock.calls).toMatchSnapshot();
      expect(chokidar.on.mock.calls[0][0]).toBe('error');
    });
    test('on ready watches language packs', async () => {
      await createHotLanguagePacks(modules, publish);
      chokidar.on.mock.calls[1][1]();
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      expect(chokidar.on.mock.calls[1][0]).toBe('ready');
    });
    test('on add hot reload language pack ', async () => {
      await createHotLanguagePacks(modules, publish);
      await chokidar.on.mock.calls[2][1]('sample-module/locale/en-US.json');
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      expect(chokidar.on.mock.calls[2][0]).toBe('add');
    });
    test('on change hot reload language pack ', async () => {
      await createHotLanguagePacks(modules, publish);
      await chokidar.on.mock.calls[3][1]('sample-module/locale/en-US.json');
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      expect(chokidar.on.mock.calls[3][0]).toBe('change');
    });
    test('on unlink hot reload language pack', async () => {
      await createHotLanguagePacks(modules, publish);
      await chokidar.on.mock.calls[4][1]('sample-module/locale/en-US.json');
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      expect(chokidar.on.mock.calls[4][0]).toBe('unlink');
    });
    test('language packs are loaded', async () => {
      const app = jest.fn();
      const languagePacks = ['en-US', 'en-GB'];
      const useLanguagePacks = true;
      await loadLanguagePacks(app, {
        languagePacks,
        useLanguagePacks,
        publish,
      });
      expect(chokidar.on.mock.calls[2][0]).toBe('add');
      expect(consoleTimeSpy.mock.calls).toMatchSnapshot();
    });
    test('language packs are not loaded', async () => {
      const app = jest.fn();
      const parameters = {
        languagePacks: [],
        useLanguagePacks: true,
        publish,
      };

      await loadLanguagePacks(app, parameters);
      expect(consoleTimeSpy.mock.calls.length).toEqual(0);
    });
  });
});
