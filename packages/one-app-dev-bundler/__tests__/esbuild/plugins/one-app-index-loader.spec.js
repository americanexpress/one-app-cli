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

import fs from 'fs';
import oneAppIndexLoader from '../../../esbuild/plugins/one-app-index-loader';
import { runOnLoadHook, runSetupAndGetLifeHooks } from './__plugin-testing-utils__';
import { BUNDLE_TYPES } from '../../../esbuild/constants/enums.js';

// Although this is an integration style tests (that aims to mock as little as possible) this
// plugin, and the injectors it composes, gather information from places that don't exist, such
// as the module that's running it.

// This file can't be understood by jest, so mock it
jest.mock('../../../esbuild/utils/get-meta-url.mjs', () => () => 'mockMetaUrl');

// Mock things that would be loaded from the modules package.json

// Mocked so that the 'provided-externals-injector' does something by default
jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn((key) => {
  if (key === 'providedExternals') {
    return ['external-package-1', 'external-package-2'];
  }
  return null;
}));

// Mocked so that the 'provided-externals-injector' can get the values it needs from a
// packages package.json
jest.mock('module', () => {
  const actualModule = jest.requireActual('module');
  return {
    ...actualModule,
    createRequire: jest.fn(() => (importName) => {
      if (importName === 'external-package-1/package.json') {
        return { version: '1.2.3' };
      }
      if (importName === 'external-package-2/package.json') {
        return { version: '4.5.6' };
      }
      return null;
    }),
  };
});

// Mocked so that the `module-metadata-injector` has a good value by default
jest.mock('../../../esbuild/utils/get-app-compatibility', () => jest.fn(() => 'mockAppCompatibility'));

// Mocked so that these tests dont end up reading this repo's package.json
jest.mock('read-pkg-up', () => ({
  readPackageUpSync: jest.fn(() => ({
    packageJson: {
      version: 'mockModuleVersion',
      name: 'axp-mock-module-name',
    },
    path: 'mock/path/to/modules/package.json',
  })),
}));

describe('Esbuild plugin oneAppIndexLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = oneAppIndexLoader({ watch: false });
    expect(plugin.name).toBe('oneAppIndexLoader');
  });

  describe('setup function', () => {
    it('should register an onLoad hook, with the right filters', () => {
      const plugin = oneAppIndexLoader({ watch: false });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onLoad.length).toBe(1);
      // eslint-disable-next-line prefer-regex-literals -- needs to match exactly
      expect(lifeCycleHooks.onLoad[0].config).toEqual({ filter: new RegExp('[\\/]modules[\\/]src[\\/]index') });
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onLoad', () => {
      let mockFileContent;
      beforeAll(() => {
        mockFileContent = fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index.input.jsx`).toString();
      });

      it('should transform inputs to outputs for browser-not-watching', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: false,
          useLiveReload: false,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_browser-not-watching.output.jsx`).toString());
      });

      it('should transform inputs to outputs for browser-watching-not-live', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: true,
          useLiveReload: false,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_browser-watching-not-live.output.jsx`).toString());
      });

      it('should transform inputs to outputs for browser-watching-live', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: true,
          useLiveReload: true,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_browser-watching-live.output.jsx`).toString());
      });

      it('should transform inputs to outputs for server-not-watching', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: false,
          useLiveReload: false,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_server-not-watching.output.jsx`).toString());
      });

      it('should transform inputs to outputs for server-watching-not-live', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: true,
          useLiveReload: false,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_server-watching-not-live.output.jsx`).toString());
      });

      it('should transform inputs to outputs for server-watching-live', async () => {
        expect.assertions(2);
        const plugin = oneAppIndexLoader({
          watch: true,
          useLiveReload: true,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(onLoadHook, {
          mockFileName: 'index.jsx',
          mockFileContent,
        });

        expect(loader).toEqual('tsx');
        expect(contents).toEqual(fs.readFileSync(`${__dirname}/__test_fixtures__/one-app-index-loader/index_server-watching-live.output.jsx`).toString());
      });
    });

    it('should throw an exception if the module is not well formed', async () => {
      expect.assertions(1);
      const plugin = oneAppIndexLoader({ bundleType: BUNDLE_TYPES.BROWSER, watch: true });
      const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

      await expect(async () => runOnLoadHook(onLoadHook,
        { mockFileName: 'index.jsx', mockFileContent: '' }
      )).rejects.toThrow('one-app-bundler: Module must use `export default VariableName` syntax in index');
    });

    it('should throw an exception if an injector removes the default export', async () => {
      expect.assertions(1);

      // it doesn't matter which injector is mocked here.
      jest.doMock('../../../esbuild/plugins/one-app-index-loader-injectors/module-metadata-injector', () => class BadInjector {
        // eslint-disable-next-line class-methods-use-this -- it doesnt' matter if 'this' is used for this mock
        inject = async () => 'not a default export!';
      });

      const plugin = oneAppIndexLoader({ bundleType: BUNDLE_TYPES.BROWSER, watch: true });
      const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

      await expect(async () => runOnLoadHook(onLoadHook,
        { mockFileName: 'index.jsx', mockFileContent: 'export default ModuleRootComponent;' }
      )).rejects.toThrow('one-app-bundler: One of the injectors removed the default export. This is a bug in the bundler. Please raise an issue.');
    });
  });
});
