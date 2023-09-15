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
import cjsCompatibilityHotpatch from '../../../esbuild/plugins/cjs-compatibility-hotpatch';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(() => 'const mock = "JavaScript Content";'),
    writeFile: jest.fn(),
  },
}));

describe('Esbuild plugin cjsCompatibilityHotpatch', () => {
  const resultsMock = {
    metafile: {
      outputs: {
        'mock/file/name.html': {},
        'mock/file/name.js': {},
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a plugin with the correct name', () => {
    expect(cjsCompatibilityHotpatch.name).toBe('cjsCompatibilityHotpatch');
  });

  describe('setup function', () => {
    it('should register an onEnd hook', () => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(cjsCompatibilityHotpatch);

      expect(lifeCycleHooks.onEnd.length).toBe(1);
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onEnd', () => {
      it('should append js to the end of the file to allow for cjs compatibility', async () => {
        expect.assertions(4);

        const onEnd = runSetupAndGetLifeHooks(cjsCompatibilityHotpatch).onEnd[0];

        await onEnd(resultsMock);

        expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
        expect(fs.promises.readFile).toHaveBeenCalledWith('mock/file/name.js', 'utf8');

        expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
        expect(fs.promises.writeFile).toHaveBeenCalledWith('mock/file/name.js', `const mock = "JavaScript Content";
;module.exports = src_default;`, 'utf8');
      });
    });

    it('should do nothing if there is no results metadata', async () => {
      expect.assertions(2);

      const onEnd = runSetupAndGetLifeHooks(cjsCompatibilityHotpatch).onEnd[0];

      await onEnd({});

      expect(fs.promises.readFile).not.toHaveBeenCalled();
      expect(fs.promises.writeFile).not.toHaveBeenCalled();
    });
  });
});
