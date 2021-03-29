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

import webpack from 'webpack';
import {
  createExternalsDllWebpackConfig,
  buildModuleExternalsDllBundle,
  createHotHolocronCompiler,
} from '../../../lib/webpack';

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

jest.mock('../../../lib/webpack/configs', () => ({
  createExternalsDllWebpackConfig: jest.fn(() => ({})),
  createHolocronModuleWebpackConfig: jest.fn(() => ({})),
}));
beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation();
});

describe('buildModuleExternalsDllBundle', () => {
  test('externals Dll are not built without arguments', async () => {
    expect.assertions(2);
    await buildModuleExternalsDllBundle();
    expect(createExternalsDllWebpackConfig).not.toHaveBeenCalled();
    expect(webpack).not.toHaveBeenCalled();
  });

  test('externals Dll are not built when none extist', async () => {
    expect.assertions(2);
    const externals = [];
    await buildModuleExternalsDllBundle({ externals });
    expect(createExternalsDllWebpackConfig).not.toHaveBeenCalled();
    expect(webpack).not.toHaveBeenCalled();
  });

  test('builds externals if included and resolves to the stats', async () => {
    expect.assertions(3);
    const externals = ['react'];
    const promise = buildModuleExternalsDllBundle({ externals });
    expect(createExternalsDllWebpackConfig).toHaveBeenCalled();
    expect(webpack.compiler.run).toHaveBeenCalled();
    const [[callback]] = webpack.compiler.run.mock.calls;
    const stats = {};
    callback(null, stats);
    await expect(promise).resolves.toBe(stats);
  });

  test('builds externals if included and rejects with error', async () => {
    expect.assertions(3);
    const externals = ['react'];
    const promise = buildModuleExternalsDllBundle({ externals });
    expect(createExternalsDllWebpackConfig).toHaveBeenCalled();
    expect(webpack.compiler.run).toHaveBeenCalled();
    const [[callback]] = webpack.compiler.run.mock.calls;
    const error = new Error('build failed');
    callback(error);
    await promise.catch((e) => {
      expect(e).toEqual(error);
      return Promise.resolve();
    });
  });
  test(' create Hot Holocron Compiler', () => {
    const config = {
      modules: [],
      externals: [],
      environmentVariables: [],
      babelConfig: [],
      webpackConfigPath: [],
    };
    createHotHolocronCompiler(config);
  });
});
