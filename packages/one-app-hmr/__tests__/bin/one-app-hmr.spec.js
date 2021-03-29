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

import { createConfig, holocronDevServer } from '../..';

jest.mock('../..', () => ({
  createConfig: jest.fn(() => Promise.resolve('config')),
  holocronDevServer: jest.fn(() => Promise.resolve({ start: jest.fn() })),
}));

function loadBin() {
  let promise = null;
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    promise = require('../../bin/one-app-hmr');
  });
  return promise;
}

describe('one-app-hmr ', () => {
  test('runs the bin script without error', async () => {
    await expect(loadBin()).resolves.toBeUndefined();
    expect(createConfig).toHaveBeenCalledTimes(1);
    expect(holocronDevServer).toHaveBeenCalledTimes(1);
    expect(holocronDevServer).toHaveBeenCalledWith('config');
  });
});
