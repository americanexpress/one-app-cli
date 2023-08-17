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
import restrictRuntimeSymbols, { getParentNode } from '../../../esbuild/plugins/restrict-runtime-symbols';
import { logWarnings, logErrors } from '../../../esbuild/utils/colorful-logging';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';
import { BUNDLE_TYPES, SEVERITY } from '../../../esbuild/constants/enums';

jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(() => 'mockFileContent'),
    writeFile: jest.fn(() => 'mockWriteFileResponse'),
  },
}));

jest.mock('../../../esbuild/utils/colorful-logging', () => ({
  logWarnings: jest.fn(),
  logErrors: jest.fn(),
}));

describe('Esbuild plugin restrictRuntimeSymbols', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = restrictRuntimeSymbols({
      severity: SEVERITY.ERROR,
      bundleType: BUNDLE_TYPES.BROWSER,
    });
    expect(plugin.name).toBe('restrictRuntimeSymbols');
  });

  describe('setup function', () => {
    it('should register an onEnd hook', () => {
      const plugin = restrictRuntimeSymbols({
        severity: SEVERITY.ERROR,
        bundleType: BUNDLE_TYPES.BROWSER,
      });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onEnd.length).toBe(1);
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onEnd for browser bundles', () => {
      it('should not log error or warning, if JS files does not contain appConfig or use restricted class', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'const val = "Module is clean";');

        const filePath = { metafile: { outputs: { '/path/to/bundle.browser.js': {} } } };
        await onEnd(filePath);

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });

      it('should not log error or warning, if appConfig is wrapped in an if(false), or being used for externals', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        // Example contains generated code for receiving 'fetchye' as an external,
        // and providing 'fetchye' as an external;
        fs.promises.readFile.mockImplementationOnce(() => `
const val = "Module is clean";

// externalsLoader:fetchye
var require_fetchye = __commonJS({
  "externalsLoader:fetchye"(exports, module) {
    init_virtual_process_polyfill();
    init_buffer();
    try {
      module.exports = globalThis.getTenantRootModule().appConfig.providedExternals["fetchye"].module;
    } catch (error) {
      const errorGettingExternal = new Error("Failed to get external fetchye from root module");
      errorGettingExternal.shouldBlockModuleReload = false;
      throw errorGettingExternal;
    }
  }
});

ExampleRoot_default.appConfig = Object.assign({}, ExampleRoot_default.appConfig, {
  providedExternals: {
    "fetchye": { version: "1.2.3", module: require_fetchye() }
  }
});

if(false) {
  ExampleRoot_default.appConfig = { csp: 'csp' };
}
        `);

        const filePath = { metafile: { outputs: { '/path/to/bundle.browser.js': {} } } };
        await onEnd(filePath);

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });

      it('should read each file that is present in the outputs', async () => {
        expect.assertions(6);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'const val = "Module1 is clean";');
        fs.promises.readFile.mockImplementationOnce(() => 'const val = "Module3 is clean";');
        // As the walker is called for every `<object>.<property>` the test needs one
        // that isn't appConfig to test the 'miss' path
        // `Module.childRoots={};` is used for this
        fs.promises.readFile.mockImplementationOnce(() => 'const val = "Module4 is properly wrapped"; Module.childRoots={}; if(false){ Module.appConfig={}; }');

        const filePath = { metafile: { outputs: { '/path/to/bundle1.browser.js': {}, '/path/to/bundle2.browser.js': {}, '/path/to/bundle3.browser.js': {} } } };
        await onEnd(filePath);

        expect(fs.promises.readFile).toHaveBeenCalledTimes(3);
        expect(fs.promises.readFile).toHaveBeenNthCalledWith(1, '/path/to/bundle1.browser.js', 'utf8');
        expect(fs.promises.readFile).toHaveBeenNthCalledWith(2, '/path/to/bundle2.browser.js', 'utf8');
        expect(fs.promises.readFile).toHaveBeenNthCalledWith(3, '/path/to/bundle3.browser.js', 'utf8');

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });

      it('should logWarnings, if JS files contains appConfig or use restricted class when severity is warning', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'const createReactClass = require("create-react-class"); Module.appConfig={};');

        const filePath = { metafile: { outputs: { '/path/to/bundle.browser.js': {} } } };
        await onEnd(filePath);

        expect(logWarnings).toHaveBeenCalledTimes(1);
        expect(logWarnings.mock.calls[0][0]).toMatchInlineSnapshot(`
          Array [
            "A Holocron module's appConfig should be wrapped in \`if(!global.BROWSER) {}\`",
            "\`create-react-class\` is restricted from being used",
          ]
        `);
      });

      it('should logErrors with multiple error messages, if JS files contains appConfig and use restricted class when severity is error', async () => {
        expect.assertions(3);
        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.ERROR,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'const createReactClass = require("create-react-class"); Module.appConfig={};');

        const filePath = { metafile: { outputs: { '/path/to/bundle.browser.js': {} } } };
        await expect(async () => onEnd(filePath)).rejects.toThrow('2 errors found. Please check logs.');

        expect(logErrors).toHaveBeenCalledTimes(1);
        expect(logErrors.mock.calls[0][0]).toMatchInlineSnapshot(`
          Array [
            "A Holocron module's appConfig should be wrapped in \`if(!global.BROWSER) {}\`",
            "\`create-react-class\` is restricted from being used",
          ]
        `);
      });

      it('should logErrors with one error message, if JS files contains appConfig when severity is error', async () => {
        expect.assertions(3);
        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.ERROR,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'Module.appConfig={};');

        const filePath = { metafile: { outputs: { '/path/to/bundle.browser.js': {} } } };
        await expect(async () => onEnd(filePath)).rejects.toThrow('1 error found. Please check logs.');

        expect(logErrors).toHaveBeenCalledTimes(1);
        expect(logErrors.mock.calls[0][0]).toMatchInlineSnapshot(`
          Array [
            "A Holocron module's appConfig should be wrapped in \`if(!global.BROWSER) {}\`",
          ]
        `);
      });

      it('should do nothing if there is no results metadata', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        await onEnd({});

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });
    });

    describe('onEnd for server bundles', () => {
      it('should not log error or warning, if JS files contains appConfig', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'Module.appConfig={};');

        const filePath = { metafile: { outputs: { '/path/to/bundle.node.js': {} } } };
        await onEnd(filePath);

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });

      it('should logErrors with one error message, if JS files contains restricted class when severity is error', async () => {
        expect.assertions(3);
        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.ERROR,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        fs.promises.readFile.mockImplementationOnce(() => 'const createReactClass = require("create-react-class");');

        const filePath = { metafile: { outputs: { '/path/to/bundle.node.js': {} } } };
        await expect(async () => onEnd(filePath)).rejects.toThrow('1 error found. Please check logs.');

        expect(logErrors).toHaveBeenCalledTimes(1);
        expect(logErrors.mock.calls[0][0]).toMatchInlineSnapshot(`
          Array [
            "\`create-react-class\` is restricted from being used",
          ]
        `);
      });

      it('should do nothing if there is no results metadata', async () => {
        expect.assertions(2);

        const plugin = restrictRuntimeSymbols({
          severity: SEVERITY.WARNING,
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onEnd = runSetupAndGetLifeHooks(plugin).onEnd[0];

        const mockResult = {};
        await onEnd(mockResult);

        expect(logWarnings).not.toHaveBeenCalled();
        expect(logErrors).not.toHaveBeenCalled();
      });
    });
  });
});

describe('getParentNode', () => {
  it('should return undefined if the supplied object is not an array', () => {
    expect(getParentNode(null, 'IfStatement')).toBe(undefined);
    expect(getParentNode({}, 'IfStatement')).toBe(undefined);
    expect(getParentNode(1, 'IfStatement')).toBe(undefined);
    expect(getParentNode('null', 'IfStatement')).toBe(undefined);
  });

  it('should return undefined if the supplied array does not have the supplied node type in it', () => {
    expect(getParentNode([
      { type: 'SomeOtherType' },
      { type: 'SomeOtherType' },
      { type: 'SomeOtherType' },
      { type: 'SomeOtherType' },
    ], 'IfStatement')).toBe(undefined);
  });

  it('should return the last node that matches the supplied type', () => {
    expect(getParentNode([
      { type: 'SomeOtherType' },
      { type: 'IfStatement', which: 'first' },
      { type: 'SomeOtherType' },
      { type: 'IfStatement', which: 'second' },
      { type: 'SomeOtherType' },
      { type: 'SomeOtherType' },
    ], 'IfStatement')).toEqual({ type: 'IfStatement', which: 'second' });
  });
});
