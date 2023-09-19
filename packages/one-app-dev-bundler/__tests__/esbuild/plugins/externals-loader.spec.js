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

import { readPackageUpSync } from 'read-pkg-up';
import externalsLoader from '../../../esbuild/plugins/externals-loader';
import { runSetupAndGetLifeHooks, runOnLoadHook } from './__plugin-testing-utils__';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';
import { BUNDLE_TYPES } from '../../../esbuild/constants/enums.js';

// Mocked so that the 'provided-externals-injector' does something by default
jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn((key) => {
  if (key === 'requiredExternals') {
    return ['external-package-1', 'external-package-2'];
  }
  return null;
}));

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: jest.fn(() => ({
    packageJson: {
      dependencies: {},
    },
  })),
}));

describe('Esbuild plugin externalsLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });
    expect(plugin.name).toBe('externalsLoader');
  });

  describe('setup function', () => {
    it('should register an onResolve hook, for each passed external names', () => {
      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onResolve.length).toBe(2);
      expect(lifeCycleHooks.onResolve[0].config).toEqual({ filter: /^external-package-1$/ });
      expect(lifeCycleHooks.onResolve[1].config).toEqual({ filter: /^external-package-2$/ });
    });

    it('should register no onResolve hooks if there are no externals', () => {
      getModulesBundlerConfig.mockImplementationOnce(() => []);
      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onResolve).toBe(undefined);
    });

    it('should register an onLoad hook, with the right filters', () => {
      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onLoad.length).toBe(1);
      expect(lifeCycleHooks.onLoad[0].config).toEqual({ filter: /.*/, namespace: 'externalsLoader' });
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onResolve', () => {
      it('should return the passed path under a new namespace', () => {
        const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });
        const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

        expect(lifeCycleHooks.onResolve.length).toBe(2);
        const pathSymbol1 = Symbol('pathSymbol1');
        expect(lifeCycleHooks.onResolve[0].hookFunction({ path: pathSymbol1 })).toEqual({ path: pathSymbol1, namespace: 'externalsLoader' });
        const pathSymbol2 = Symbol('pathSymbol2');
        expect(lifeCycleHooks.onResolve[1].hookFunction({ path: pathSymbol2 })).toEqual({ path: pathSymbol2, namespace: 'externalsLoader' });
      });
    });

    describe('onLoad', () => {
      it('should transform inputs to outputs for browser', async () => {
        expect.assertions(2);
        const plugin = externalsLoader({
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook,
          {
            mockFileName: 'mock-package-name',
            mockFileContent: 'const mockJS = "Some Mock JS";',
          }
        );

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"
          try {
            const Holocron = globalThis.Holocron;
            const fallbackExternal = Holocron.getExternal && Holocron.getExternal({
              name: 'mock/path/to/file/mock-package-name',
              version: 'undefined'
            });
            const rootModuleExternal = globalThis.getTenantRootModule && globalThis.getTenantRootModule().appConfig.providedExternals['mock/path/to/file/mock-package-name'];

            module.exports = fallbackExternal || (rootModuleExternal ? rootModuleExternal.module : () => {
              throw new Error('[Symbol(BUNDLE_TYPES-BROWSER)][undefined] External not found: mock/path/to/file/mock-package-name');
            })
          } catch (error) {
            const errorGettingExternal = new Error([
              '[Symbol(BUNDLE_TYPES-BROWSER)] Failed to get external fallback mock/path/to/file/mock-package-name',
              error.message
            ].filter(Boolean).join(' :: '));

            errorGettingExternal.shouldBlockModuleReload = false;

            throw errorGettingExternal;
          }
        "
`);
      });
      it('should transform inputs to outputs for server', async () => {
        expect.assertions(2);
        const plugin = externalsLoader({
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook,
          {
            mockFileName: 'mock-package-name',
            mockFileContent: 'const mockJS = "Some Mock JS";',
          }
        );

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"
          try {
            const Holocron = require(\\"holocron\\");
            const fallbackExternal = Holocron.getExternal && Holocron.getExternal({
              name: 'mock/path/to/file/mock-package-name',
              version: 'undefined'
            });
            const rootModuleExternal = global.getTenantRootModule && global.getTenantRootModule().appConfig.providedExternals['mock/path/to/file/mock-package-name'];

            module.exports = fallbackExternal || (rootModuleExternal ? rootModuleExternal.module : () => {
              throw new Error('[Symbol(BUNDLE_TYPES-SERVER)][undefined] External not found: mock/path/to/file/mock-package-name');
            })
          } catch (error) {
            const errorGettingExternal = new Error([
              '[Symbol(BUNDLE_TYPES-SERVER)] Failed to get external fallback mock/path/to/file/mock-package-name',
              error.message
            ].filter(Boolean).join(' :: '));

            errorGettingExternal.shouldBlockModuleReload = false;

            throw errorGettingExternal;
          }
        "
`);
      });
    });
  });

  describe('readPackageUpSync', () => {
    it('function call could return a nullable value', () => {
      readPackageUpSync.mockImplementationOnce(() => undefined);

      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });

      expect(() => runSetupAndGetLifeHooks(plugin)).toThrowError("Missing 'package.json'");
    });

    it('throws an error when package json is falsy', () => {
      readPackageUpSync.mockImplementationOnce(() => ({
        packageJson: undefined,
      }));

      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });

      expect(() => runSetupAndGetLifeHooks(plugin)).toThrowError("Missing 'package.json'");
    });

    it('throws an error when "dependencies" is falsy', () => {
      readPackageUpSync.mockImplementationOnce(() => ({
        packageJson: {
          dependencies: undefined,
        },
      }));

      const plugin = externalsLoader({ bundleType: BUNDLE_TYPES.BROWSER });

      expect(() => runSetupAndGetLifeHooks(plugin)).toThrowError("'package.json' does not have 'dependencies' key");
    });
  });
});
