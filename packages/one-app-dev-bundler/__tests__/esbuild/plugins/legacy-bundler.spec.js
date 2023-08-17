/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import fs from 'node:fs';
import swc from '@swc/core';
import legacyBundler from '../../../esbuild/plugins/legacy-bundler';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(() => 'mockFileContent'),
    writeFile: jest.fn(() => 'mockWriteFileResponse'),
  },
}));

jest.mock('@swc/core', () => ({
  transform: jest.fn(() => Promise.resolve({
    code: 'var legacy = true;',
    map: 'mockedSourceMap',
  })),
}));

describe('Esbuild plugin legacyBundler', () => {
  let oldEnv;

  beforeAll(() => {
    oldEnv = process.env.NODE_ENV;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv;
  });

  it('should be a function that returns a plugin with the correct name', () => {
    expect(legacyBundler('test').name).toBe('legacyBundler');
  });

  describe('setup function', () => {
    it('does not register an onEnd hook in a non-production environment', () => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(legacyBundler('test'));

      expect(lifeCycleHooks.onEnd).toBe(undefined);
    });

    it('registers an onEnd hook in production environment', () => {
      process.env.NODE_ENV = 'production';

      const lifeCycleHooks = runSetupAndGetLifeHooks(legacyBundler('test'));

      expect(lifeCycleHooks.onEnd.length).toBe(1);
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onEnd', () => {
      it('converts the bundle to ES5 for legacy browser support', async () => {
        process.env.NODE_ENV = 'production';

        expect.assertions(6);

        const hooks = runSetupAndGetLifeHooks(legacyBundler('test'));
        const onEnd = hooks.onEnd[0];

        const mockResult = {
          metafile: {
            outputs: {
              '/path/to/1.2.3/test.browser.js': {},
            },
          },
        };
        const results = await onEnd(mockResult);

        expect(swc.transform).toHaveBeenCalledWith('mockFileContent', { jsc: { target: 'es5' } });
        expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
        expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/1.2.3/test.browser.js', 'utf-8');
        expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
        expect(fs.promises.writeFile).toHaveBeenCalledWith('/path/to/1.2.3/test.legacy.browser.js', 'var legacy = true;');

        expect(results).toStrictEqual(mockResult);
      });

      it('does not convert the bundle to ES5 when naming formatting is not the expected one', async () => {
        process.env.NODE_ENV = 'production';

        // expect.assertions(6);

        const hooks = runSetupAndGetLifeHooks(legacyBundler('test'));
        const onEnd = hooks.onEnd[0];

        const mockResult = {
          metafile: {
            outputs: {
              '/path/to/1.2.3/image.png': {},
            },
          },
        };
        const results = await onEnd(mockResult);

        expect(swc.transform).not.toHaveBeenCalled();
        expect(fs.promises.readFile).not.toHaveBeenCalled();
        expect(fs.promises.writeFile).not.toHaveBeenCalled();

        expect(results).toStrictEqual(mockResult);
      });
    });
  });
});
