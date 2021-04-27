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

import { getModuleFromFilePath } from '../../../../src/utils/helpers';

import HolocronWebpackPlugin from '../../../../src/webpack/plugins/holocron-webpack-plugin';
import { getWebpackVersion } from '../../../../src/webpack/helpers';

jest.mock('../../../../src/webpack/helpers', () => ({
  getWebpackVersion: jest.fn(() => 5),
}));

jest.mock('../../../../src/utils/helpers', () => {
  const originalModule = jest.requireActual('../../../../src/utils/helpers');

  return {
    ...originalModule,
    getModuleFromFilePath: jest.fn(() => true),
  };
});
beforeEach(() => {
  jest.clearAllMocks();
});

describe('HolocronWebpackPlugin', () => {
  test('instantiates without error', () => {
    expect(() => new HolocronWebpackPlugin()).not.toThrow();
  });

  test('plugin is applied to compilation and taps into loader webpack hook for version 5', () => {
    const instance = new HolocronWebpackPlugin();
    const tap = jest.fn();
    const compiler = {
      hooks: {
        compilation: {
          tap,
        },
      },
      webpack: {
        NormalModule: {
          getCompilationHooks: jest.fn(() => ({
            loader: {
              tap: jest.fn(),
            },
          })),
        },
      },
    };
    expect(instance.apply(compiler)).toBe(undefined);
    const [[, hookHandle]] = tap.mock.calls;
    const compilation = {};
    expect(() => hookHandle(compilation)).not.toThrow();
    expect(compiler.webpack.NormalModule.getCompilationHooks).toHaveBeenCalledWith(compilation);
  });
  test('plugin is applied to compilation for webpack v4 hook', () => {
    getWebpackVersion.mockImplementationOnce(() => 4);
    const instance = new HolocronWebpackPlugin();
    const tap = jest.fn();
    const compiler = {
      hooks: {
        compilation: {
          tap,
        },
      },
      webpack: {
        NormalModule: {
          getCompilationHooks: jest.fn(() => ({
            loader: {
              tap: jest.fn(),
            },
          })),
        },
      },
    };
    expect(instance.apply(compiler)).toBe(undefined);
    const [[, hookHandle]] = tap.mock.calls;
    const compilation = {
      hooks: {
        normalModuleLoader: {
          tap,
        },
        webpack: {
          NormalModule: {
            getCompilationHooks: jest.fn(() => ({
              loader: {
                tap: jest.fn(),
              },
            })),
          },
        },
      },
    };
    expect(() => hookHandle(compilation)).not.toThrow();
    expect(tap).toHaveBeenCalledTimes(2);
    expect(compiler.webpack.NormalModule.getCompilationHooks).not.toHaveBeenCalledWith(compilation);
  });

  test('plugin loader hook registers a loader before other loaders', () => {
    const options = {
      modules: [{ moduleName: 'root-module', modulePath: 'root-module' }],
      externals: ['supplied-external'],
    };
    const module = {
      userRequest: 'root-module/src/index.js',
      loaders: [
        {
          loader: 'random-loader',
        },
      ],
    };
    module.loaders.push = jest.fn();
    const instance = new HolocronWebpackPlugin(options);
    expect(instance.loaderHook(null, module)).toBe(undefined);
    expect(module.loaders.push).toHaveBeenCalledTimes(1);
  });
  test('plugin loader is not added if local modules are not present', () => {
    getModuleFromFilePath.mockImplementation(() => false);
    const options = {
      modules: [{ moduleName: 'root-module', modulePath: 'root-module' }],
      externals: ['supplied-external'],
    };
    const module = {
      userRequest: 'root-module/src/index.js',
      loaders: [
        {
          loader: 'random-loader',
        },
      ],
    };
    module.loaders.push = jest.fn();
    const instance = new HolocronWebpackPlugin(options);
    expect(instance.loaderHook(null, module)).toBe(undefined);
    expect(module.loaders.push).not.toHaveBeenCalled();
  });

  test('plugin loader is not added if not an expected entry', () => {
    const options = {
      modules: [{ moduleName: 'root-module' }],
      externals: ['supplied-external'],
    };
    const module = {
      userRequest: 'root-module/src/another-file.js',
      loaders: [
        {
          loader: 'random-loader',
        },
      ],
    };
    module.loaders.push = jest.fn();
    const instance = new HolocronWebpackPlugin(options);
    expect(instance.loaderHook(null, module)).toBe(undefined);
    expect(module.loaders.push).not.toHaveBeenCalled();
  });
});
