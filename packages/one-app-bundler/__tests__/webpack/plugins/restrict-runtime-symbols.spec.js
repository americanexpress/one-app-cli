/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

import fs from 'node:fs';
import { validateAppConfig } from '@americanexpress/one-app-dev-bundler';
import RestrictRuntimeSymbols from '../../../webpack/plugins/restrict-runtime-symbols.js';

jest.mock('@americanexpress/one-app-dev-bundler', () => ({
  validateAppConfig: jest.fn(() => []),
}));

jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  readFileSync: jest.fn(() => ''),
}));

describe('RestrictRuntimeSymbols', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should Register an assetEmitted tap hook', () => {
    const plugin = new RestrictRuntimeSymbols();

    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn(),
        },
      },
    };

    plugin.apply(mockCompiler);

    expect(mockCompiler.hooks.assetEmitted.tap).toHaveBeenCalledTimes(1);
    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('The registered function should not throw with a file containing no problems', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    fs.readFileSync.mockImplementationOnce(() => 'console.log(`no problems`)');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    expect(() => registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.node.js' })).not.toThrow();
    expect(() => registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.browser.js' })).not.toThrow();

    expect(fs.readFileSync).toHaveBeenCalledTimes(2);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('The registered function should throw if `create-react-class` is used in node bundles', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    fs.readFileSync.mockImplementationOnce(() => 'console.log(`create-react-class`)');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    expect(() => registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.node.js' })).toThrow('`create-react-class` is restricted from being used');

    expect(fs.readFileSync).toHaveBeenCalledTimes(1);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('The registered function should throw if `create-react-class` is used in browser bundles', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    fs.readFileSync.mockImplementationOnce(() => 'console.log(`create-react-class`)');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    expect(() => registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.browser.js' })).toThrow('`create-react-class` is restricted from being used');

    expect(fs.readFileSync).toHaveBeenCalledTimes(1);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('should call validateAppConfig with the file content if it containts `.appConfig`', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    fs.readFileSync.mockImplementationOnce(() => 'Module.appConfig = `someConfig`;');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.browser.js' });

    expect(validateAppConfig).toHaveBeenCalledTimes(1);
    expect(validateAppConfig).toHaveBeenNthCalledWith(1, 'Module.appConfig = `someConfig`;');

    expect(fs.readFileSync).toHaveBeenCalledTimes(1);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('should thrown an error if validateAppConfig returns messages', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    validateAppConfig.mockImplementationOnce(() => ['Error Message Mock']);
    fs.readFileSync.mockImplementationOnce(() => 'Module.appConfig = `someConfig`;');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    expect(() => registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.browser.js' })).toThrow('appConfig validation failed with the following messages: [ Error Message Mock ]');

    expect(validateAppConfig).toHaveBeenCalledTimes(1);
    expect(validateAppConfig).toHaveBeenNthCalledWith(1, 'Module.appConfig = `someConfig`;');

    expect(fs.readFileSync).toHaveBeenCalledTimes(1);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });

  it('should do nothing for other bundles', () => {
    const plugin = new RestrictRuntimeSymbols();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    validateAppConfig.mockImplementationOnce(() => ['Error Message Mock']);
    fs.readFileSync.mockImplementationOnce(() => 'Module.appConfig = `create-react-class`;');

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.other.js' });

    expect(validateAppConfig).toHaveBeenCalledTimes(0);
    expect(fs.readFileSync).toHaveBeenCalledTimes(0);

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('RestrictRuntimeSymbols');
  });
});
