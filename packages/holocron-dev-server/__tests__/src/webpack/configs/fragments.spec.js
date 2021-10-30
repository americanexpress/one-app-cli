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
