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

import bundleAssetSizeLimiter from '../../../esbuild/plugins/bundle-asset-size-limiter';
import getModulesWebpackConfig from '../../../esbuild/utils/get-modules-webpack-config';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

jest.mock('../../../esbuild/utils/get-modules-webpack-config', () => jest.fn());
jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn());

jest.spyOn(console, 'log');
jest.spyOn(console, 'warn');
jest.spyOn(console, 'error');

// these tests want to 'see' chalk formatting
jest.mock('chalk', () => ({
  yellow: (str) => `<chalk.yellow>${str}</chalk.yellow>`,
  red: (str) => `<chalk.red>${str}</chalk.red>`,
}));

describe('Esbuild plugin bundleAssetSizeLimiter', () => {
  const params = {
    watch: false,
    severity: 'warning',
  };

  const makeResultsMock = (fileSize) => ({
    metafile: {
      outputs: {
        'mock/file/name.html': {
          bytes: fileSize,
        },
        'mock/file/name.js': {
          bytes: fileSize,
        },
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = bundleAssetSizeLimiter({ ...params });

    expect(plugin.name).toBe('bundleAssetSizeLimiter');
  });

  describe('setup function', () => {
    it('should register an onEnd hook', () => {
      const plugin = bundleAssetSizeLimiter({ ...params });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onEnd.length).toBe(1);
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onEnd', () => {
      it('should add messages to the result, and logWarnings, if JS files in the output are to big, using default size restrictions and config', async () => {
        expect.assertions(2);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => null);

        const plugin = bundleAssetSizeLimiter({ ...params });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const output = await onEnd(makeResultsMock(1e7));

        expect(console).toHaveLogs([
          '<chalk.yellow>Warnings:</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (9765KB) is larger than the performance budget (244KB)</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (9765KB) is larger than the performance budget (244KB)</chalk.yellow>',
        ]);

        expect(output.messages).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "mock/file/name.js (9765KB) is larger than the performance budget (244KB)",
  },
  Object {
    "text": "mock/file/name.js (9765KB) is larger than the performance budget (244KB)",
  },
]
`);
      });

      it('should do nothing in watch mode', async () => {
        expect.assertions(2);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => null);

        const plugin = bundleAssetSizeLimiter({ ...params, watch: true });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const output = await onEnd(makeResultsMock(1e7));

        expect(console).not.toHaveLogs();
        expect(output.messages).toBe(undefined);
      });

      it('should do nothing if the files are small enough', async () => {
        expect.assertions(2);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => null);

        const plugin = bundleAssetSizeLimiter({ ...params });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const output = await onEnd(makeResultsMock(5));

        expect(console).not.toHaveLogs();
        expect(output.messages).toBe(undefined);
      });

      it('should call for the configs with the right params', async () => {
        expect.assertions(5);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => null);

        const plugin = bundleAssetSizeLimiter({ ...params });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        await onEnd(makeResultsMock(5));

        expect(getModulesBundlerConfig).toHaveBeenCalledTimes(2);
        expect(getModulesBundlerConfig).toHaveBeenCalledWith('maxAssetSize');
        expect(getModulesBundlerConfig).toHaveBeenCalledWith('performanceBudget');
        expect(getModulesWebpackConfig).toHaveBeenCalledTimes(1);
        expect(getModulesWebpackConfig).toHaveBeenCalledWith(['performance', 'maxAssetSize']);
      });

      it('should logErrors and throw, if JS files in the output are to big, with severity=error', async () => {
        expect.assertions(2);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => null);

        const plugin = bundleAssetSizeLimiter({ ...params, severity: 'error' });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const results = makeResultsMock(1e7);

        await expect(async () => onEnd(results)).rejects.toThrow('Performance Limit Reached');

        expect(console).toHaveLogs([
          '<chalk.red>Errors:</chalk.red>',
          '<chalk.red>    mock/file/name.js (9765KB) is larger than the performance budget (244KB)</chalk.red>',
          '<chalk.red>    mock/file/name.js (9765KB) is larger than the performance budget (244KB)</chalk.red>',
        ]);
      });

      it('should add messages to the result, and logWarnings, if JS files in the output are to big, using the bundle config', async () => {
        expect.assertions(3);

        getModulesBundlerConfig.mockImplementation(() => 2000);
        getModulesWebpackConfig.mockImplementation(() => 1e10);

        const plugin = bundleAssetSizeLimiter({ ...params });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const output = await onEnd(makeResultsMock(4000));

        // if there is a bundler config, don't even try to load the webpack config
        expect(getModulesWebpackConfig).toHaveBeenCalledTimes(0);

        expect(console).toHaveLogs([
          '<chalk.yellow>Warnings:</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (3KB) is larger than the performance budget (1KB)</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (3KB) is larger than the performance budget (1KB)</chalk.yellow>',
        ]);

        expect(output.messages).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "mock/file/name.js (3KB) is larger than the performance budget (1KB)",
  },
  Object {
    "text": "mock/file/name.js (3KB) is larger than the performance budget (1KB)",
  },
]
`);
      });

      it('should add messages to the result, and logWarnings, if JS files in the output are to big, using a custom webpack config', async () => {
        expect.assertions(2);

        getModulesBundlerConfig.mockImplementation(() => null);
        getModulesWebpackConfig.mockImplementation(() => 2000);

        const plugin = bundleAssetSizeLimiter({ ...params });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const output = await onEnd(makeResultsMock(4000));

        expect(console).toHaveLogs([
          '<chalk.yellow>Warnings:</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (3KB) is larger than the performance budget (1KB)</chalk.yellow>',
          '<chalk.yellow>    mock/file/name.js (3KB) is larger than the performance budget (1KB)</chalk.yellow>',
        ]);

        expect(output.messages).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "mock/file/name.js (3KB) is larger than the performance budget (1KB)",
  },
  Object {
    "text": "mock/file/name.js (3KB) is larger than the performance budget (1KB)",
  },
]
`);
      });
    });

    it('should do nothing if there is no results metadata', async () => {
      expect.assertions(2);

      getModulesBundlerConfig.mockImplementation(() => null);
      getModulesWebpackConfig.mockImplementation(() => null);

      const plugin = bundleAssetSizeLimiter({ ...params });
      const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

      const output = await onEnd({});

      expect(console).not.toHaveLogs();
      expect(output.messages).toBe(undefined);
    });
  });
});
