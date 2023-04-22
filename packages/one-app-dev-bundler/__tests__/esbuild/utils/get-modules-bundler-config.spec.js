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

import { readPackageUpSync } from 'read-pkg-up';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: jest.fn(() => ({
    packageJson: {
      'one-amex': {
        bundler: {
          mockConfigItem: 'MockConfigValue',
        },
      },
    },
  })),
}));

describe('the getModulesBundlerConfig util function', () => {
  it('should return the app compatibility from the package.json if it exists', () => {
    expect(getModulesBundlerConfig()).toEqual({
      mockConfigItem: 'MockConfigValue',
    });
  });

  it('should return the sub value of the config if a key is provided', () => {
    expect(getModulesBundlerConfig('mockConfigItem')).toEqual('MockConfigValue');
  });

  it('should return undefined if the field is not present', () => {
    readPackageUpSync.mockImplementationOnce(() => ({ packageJson: {} }));
    expect(getModulesBundlerConfig()).toBe(undefined);
  });

  it('should return undefined if the provided key is not present', () => {
    expect(getModulesBundlerConfig('unknownKey')).toEqual(undefined);
  });
});
