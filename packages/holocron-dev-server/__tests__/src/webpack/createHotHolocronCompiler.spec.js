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

import createHotHolocronCompiler from '../../../src/webpack/createHotHolocronCompiler';

jest.mock('webpack', () => {
  const tap = jest.fn();
  const run = jest.fn();
  const compiler = {
    run,
    hooks: {
      done: {
        tap,
      },
      invalid: {
        tap,
      },
    },
    resolvers: {
      normal: {
        fileSystem: null,
      },
      context: {
        fileSystem: null,
      },
    },
  };
  const mockWebpack = jest.fn(() => compiler);
  mockWebpack.compiler = compiler;
  return mockWebpack;
});

jest.mock('../../../src/webpack/configs/bundles', () => ({
  createExternalsDllWebpackConfig: jest.fn(() => ({})),
  createHolocronModuleWebpackConfig: jest.fn(() => ({})),
}));
beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation();
});

describe('createHotHolocronCompiler', () => {
  test('create Hot Holocron Compiler', () => {
    const config = {
      modules: [],
      environmentVariables: [],
      webpackConfigPath: [],
    };
    expect(() => createHotHolocronCompiler(config)).not.toThrow();
  });
});
