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

const webpack = require('webpack');
const processStats = require('../../utils/processStats');
const buildWebpack = require('../../utils/buildWebpack');

jest.mock('webpack');
jest.mock('../../utils/processStats');

beforeAll(() => {
  jest.spyOn(console, 'error');
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('buildWebpack', () => {
  it('should not throw', async () => {
    const multiStats = { stats: [{}, {}] };
    webpack.mockImplementation((configs, callback) => callback(null, multiStats));
    await expect(buildWebpack()).resolves.toEqual(multiStats);
    expect(webpack).toHaveBeenCalledTimes(1);
    expect(webpack).toHaveBeenCalledWith([], expect.any(Function));
    expect(processStats).toHaveBeenCalledTimes(2);
  });

  it('should resolve when webpack fails and log the error + details', async () => {
    const error = new Error('failure');
    error.details = 'details';
    webpack.mockImplementation((configs, callback) => callback(error));
    await expect(buildWebpack()).resolves.toEqual(undefined);
    expect(processStats).not.toHaveBeenCalled();
  });

  it('should a string for an error', async () => {
    const error = 'failure message';
    webpack.mockImplementation((configs, callback) => callback(error));
    await expect(buildWebpack()).resolves.toEqual(undefined);
    expect(processStats).not.toHaveBeenCalled();
  });
});
