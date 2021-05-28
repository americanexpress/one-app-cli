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

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { createHotHolocronCompiler, buildModuleExternalsDllBundle } from '../../../src/webpack/builds';
import { setPublisher } from '../../../src/utils/publish';
import loadWebpackMiddleware from '../../../src/middleware/webpack';

jest.mock('webpack-dev-middleware');
jest.mock('webpack-hot-middleware');
jest.mock('../../../src/utils/publish');
jest.mock('../../../src/webpack/builds');

const publish = jest.fn();
const waitUntilValid = jest.fn((callback) => callback());

beforeAll(() => {
  webpackHotMiddleware.mockImplementation(() => ({ publish }));
  webpackDevMiddleware.mockImplementation(() => ({ waitUntilValid }));
  createHotHolocronCompiler.mockImplementation(() => 'holocron-compiler');
  buildModuleExternalsDllBundle.mockImplementation(() => Promise.resolve());
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadWebpackMiddleware', () => {
  test('returns dev and hot middleware handles along with publish fn', async () => {
    expect(await loadWebpackMiddleware()).toEqual([webpackDevMiddleware(), webpackHotMiddleware()]);
    expect(waitUntilValid).toHaveBeenCalledTimes(1);
  });

  test('sets publish when made available by hot middleware', async () => {
    await loadWebpackMiddleware();
    expect(setPublisher).toHaveBeenCalledTimes(1);
    expect(setPublisher.mock.calls[0][0]()).toBe(undefined);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  test('builds externals when they are present', async () => {
    await loadWebpackMiddleware({ externals: ['some-external'] });
    expect(buildModuleExternalsDllBundle).toHaveBeenCalledTimes(1);
  });
});
