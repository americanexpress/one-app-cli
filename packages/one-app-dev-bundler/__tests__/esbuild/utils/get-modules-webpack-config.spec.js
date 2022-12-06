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

import { createRequire } from 'module';
import getModulesWebpackConfig from '../../../esbuild/utils/get-modules-webpack-config';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';

const mockConfig = {
  unavailableKeyMock: 'mockValue',
  performance: {
    maxAssetSize: 'mockMaxAssetSize',
  },
};

// This is the mock of the thing that is required, which in would be the webpack config
// But the test can assume that the webpack config returned some POJO
jest.mock('module', () => ({
  createRequire: jest.fn(() => () => mockConfig),
}));

// This file contains the magic `mjs` only code that jest doesnt understand, so it must be mocked
jest.mock('../../../esbuild/utils/get-meta-url.mjs', () => () => 'mockMetaUrl');

// mock this, as this would be looked up in the modules package.json.
jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn(() => '/path/to/mockBundlerConfig.json'));

jest.spyOn(process, 'cwd');

describe('logging helpers', () => {
  let mockedCreatedRequire;
  beforeEach(() => {
    jest.clearAllMocks();

    // reconstruct the createRequire mock chain so the tests can check the params are all correct
    mockedCreatedRequire = jest.fn(() => mockConfig);
    createRequire.mockImplementation(() => mockedCreatedRequire);
  });

  it('should create a require, and require the right value from within', () => {
    process.cwd.mockImplementationOnce(() => '/mock/cwd/path');

    getModulesWebpackConfig(['performance', 'maxAssetSize']);

    expect(process.cwd).toHaveBeenCalledTimes(1);
    expect(process.cwd).toHaveBeenCalledWith();

    expect(createRequire).toHaveBeenCalledTimes(1);
    expect(createRequire).toHaveBeenCalledWith('mockMetaUrl');

    expect(mockedCreatedRequire).toHaveBeenCalledTimes(1);
    expect(mockedCreatedRequire).toHaveBeenCalledWith('/mock/cwd/path/path/to/mockBundlerConfig.json');
  });

  it('should throw if passed no keyArray', () => {
    expect(() => getModulesWebpackConfig()).toThrow('You must provide a key array with at-least one string, general access to the webpack config is not supported');
  });

  it('should return the part of the config selected by the keyArray', () => {
    const value = getModulesWebpackConfig(['performance', 'maxAssetSize']);

    expect(value).toBe('mockMaxAssetSize');
  });

  it('should return null if the bundlerConfig is not a string', () => {
    getModulesBundlerConfig.mockImplementation(() => null);

    expect(getModulesWebpackConfig(['performance', 'maxAssetSize'])).toEqual(null);
  });
});
