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
import timeBuild from '../../../esbuild/plugins/time-build';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

jest.spyOn(process.hrtime, 'bigint');
jest.spyOn(console, 'log');

jest.mock('node:fs', () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe('Esbuild plugin timeBuild', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = timeBuild({ bundleName: 'mockBundleName', watch: false });
    expect(plugin.name).toBe('timeBuild');
  });

  describe('setup function', () => {
    it('should register an onEnd hook and an onStart hook', () => {
      const plugin = timeBuild({ bundleName: 'mockBundleName', watch: false });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onEnd.length).toBe(1);
      expect(lifeCycleHooks.onStart.length).toBe(1);
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onStart', () => {
      it('should call for the current time as a bigint', () => {
        const plugin = timeBuild({ bundleName: 'mockBundleName', watch: false });
        const onStart = runSetupAndGetLifeHooks(plugin).onStart[0];

        onStart();

        expect(process.hrtime.bigint).toHaveBeenCalledTimes(1);
        expect(process.hrtime.bigint).toHaveBeenCalledWith();
      });
    });

    describe('onEnd', () => {
      it('should append a `durationMs` value to the result, and log it', async () => {
        const plugin = timeBuild({ bundleName: 'mockBundleName', watch: false });
        const hooks = runSetupAndGetLifeHooks(plugin);
        const onStart = hooks.onStart[0];
        const onEnd = hooks.onEnd[0];

        process.hrtime.bigint.mockImplementation(() => BigInt(1000000)); // 1ms in nanoseconds
        onStart(); // call onStart to load in the start time
        jest.clearAllMocks();

        process.hrtime.bigint.mockImplementation(() => BigInt(4000000)); // 4ms in nanoseconds

        const results = await onEnd({
          metafile: {
            outputs: {
              'file.js': {},
            },
          },
        });

        expect(process.hrtime.bigint).toHaveBeenCalledTimes(1);
        expect(process.hrtime.bigint).toHaveBeenCalledWith();

        expect(results.durationMs).toBe(3);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('mockBundleName bundle built in 3ms');
        expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
        expect(fs.promises.writeFile).toHaveBeenCalledWith('.esbuild-stats.mockBundleName.json', '{"file.js":{},"durationMs":3}');
      });

      it('should not log in watch mode', async () => {
        const plugin = timeBuild({ bundleName: 'mockBundleName', watch: true });
        const hooks = runSetupAndGetLifeHooks(plugin);
        const onStart = hooks.onStart[0];
        const onEnd = hooks.onEnd[0];

        process.hrtime.bigint.mockImplementation(() => BigInt(1000000)); // 1ms in nanoseconds
        onStart(); // call onStart to load in the start time
        jest.clearAllMocks();

        process.hrtime.bigint.mockImplementation(() => BigInt(4000000)); // 4ms in nanoseconds

        await onEnd({});

        expect(console.log).toHaveBeenCalledTimes(0);
      });
    });
  });
});
