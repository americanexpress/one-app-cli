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

import path from 'path';

import {
  createResolverConfigFragment,
  createWatchOptionsConfigFragment,
  createExternalsFragment,
  createHolocronModuleLoadersFragment,
} from '../../../../src/webpack/configs/fragments';

jest.mock('../../../../src/webpack/helpers', () => {
  const originalModule = jest.requireActual('../../../../src/webpack/helpers');

  return {
    ...originalModule,
    getWebpackVersion: jest.fn(() => 5),
  };
});
const { NODE_ENV } = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = NODE_ENV;
});

describe('createResolverConfigFragment', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => '/path');
  jest.spyOn(path, 'relative').mockImplementation(() => '/relative/path');

  test('returns config fragment for resolver', () => {
    const fragment = createResolverConfigFragment({
      modules: [{
        modulePath: 'module/path',
      },
      ],
    });
    expect(fragment.resolve)
      .toEqual({
        alias: {},
        extensions: [
          '.js',
          '.jsx',
        ],
        mainFields: [
          'module',
          'browser',
          'main',
        ],
        modules: [
          'node_modules',
          '/relative/path',
          '/path/module/path/src',
          '/path/module/path/node_modules',
        ],
      }
      );
  });
});
describe('createWatchOptionsConfigFragment', () => {
  test('returns config fragment for watch options', () => {
    const fragment = createWatchOptionsConfigFragment();
    expect(fragment)
      .toEqual({
        watchOptions: {
          aggregateTimeout: 200,
          ignored: '**/node_modules',
        },
      });
  });
});

describe('createExternalsFragment', () => {
  it('adds loaders for modules which providesExternals', () => {
    const modules = [{
      moduleName: 'test-root-module',
      modulePath: '/path/to/test-root-module',
      rootModule: true,
      providedExternals: ['common-dep'],
    }];
    const webpackConfigfragment = createExternalsFragment(modules);
    expect(webpackConfigfragment).toEqual({
      module: {
        rules: [
          {
            test: '/path/to/test-root-module/src/index',
            use: [{
              loader: '@americanexpress/one-app-bundler/webpack/loaders/provided-externals-loader',
              options: {
                moduleName: 'test-root-module',
                providedExternals: ['common-dep'],
              },
            }],
          },
        ],
      },
    });
  });

  it('adds loaders for modules with requiredExternals', () => {
    const modules = [{
      moduleName: 'test-child-module',
      modulePath: '/path/to/test-child-module',
      requiredExternals: ['common-dep'],
    }];

    const webpackConfigfragment = createExternalsFragment(modules);
    expect(webpackConfigfragment).toEqual({
      module: {
        rules: [
          {
            test: '/path/to/test-child-module/node_modules/common-dep/',
            use: [{
              loader: '@americanexpress/one-app-bundler/webpack/loaders/externals-loader',
              options: {
                externalName: 'common-dep',
              },
            }],
          },
          {
            test: '/path/to/test-child-module/src/index',
            use: [{
              loader: '@americanexpress/one-app-bundler/webpack/loaders/validate-required-externals-loader',
              options: {
                requiredExternals: ['common-dep'],
              },
            }],
          },
        ],
      },
    });
  });

  it('does not add provided external loaders when not root module', () => {
    const modules = [{
      moduleName: 'test-root-module',
      modulePath: '/path/to/test-root-module',
      providedExternals: ['common-dep'],
    }];

    const webpackConfigfragment = createExternalsFragment(modules);
    expect(webpackConfigfragment).toEqual({});
  });
});

describe('createHolocronModuleLoadersFragment', () => {
  const modules = [{
    moduleName: 'test-root-module',
    modulePath: '/path/to/test-root-module',
    providedExternals: ['common-dep'],
  }];

  const webpackConfigfragment = createHolocronModuleLoadersFragment(modules);

  expect(webpackConfigfragment).toEqual({
    module: {
      rules: [{
        test: '/path/to/test-root-module/src/index',
        use: [{
          loader: '@americanexpress/holocron-dev-server/src/webpack/loaders/holocron-webpack-loader',
          options: { moduleName: 'test-root-module' },
        }],
      }],
    },
  });
});
