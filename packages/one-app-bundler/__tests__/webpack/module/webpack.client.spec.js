/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

import { readPackageUpSync } from 'read-pkg-up';
import path from 'node:path';
import { validateWebpackConfig } from '../../../test-utils.js';
import getConfigOptions from '../../../utils/getConfigOptions.js';
import configGenerator from '../../../webpack/module/webpack.client.js';

jest.mock('../../../utils/getConfigOptions', () => jest.fn(() => ({ purgecss: {} })));
jest.spyOn(process, 'cwd').mockImplementation(() => __dirname.split(`${path.sep}__tests__`)[0]);

jest.mock('../../../utils/getMetaUrl.mjs', () => () => 'metaUrlMock');

jest.mock('node:url', () => ({
  fileURLToPath: jest.fn((url) => `/mock/path/for/url/${url}`),
}));

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: jest.fn(() => ({
    packageJson: {
      name: 'package-name-mock',
      version: '1.2.3-version-mock',
    },
  })),
}));

describe('webpack/module.client', () => {
  let originalNodeEnv;
  beforeAll(() => { originalNodeEnv = process.env.NODE_ENV; });
  afterAll(() => { process.env.NODE_ENV = originalNodeEnv; });

  it('should export valid webpack config', async () => {
    expect.assertions(1);
    const webpackConfig = await configGenerator();
    expect(() => validateWebpackConfig(webpackConfig)).not.toThrow();
  });

  it('should provide the envName to babel', async () => {
    expect.assertions(2);
    const modernWebpackConfig = await configGenerator('modern');
    const legacyWebpackConfig = await configGenerator('legacy');
    expect(modernWebpackConfig.module.rules[3].use[0].options.envName).toBe('modern');
    expect(legacyWebpackConfig.module.rules[3].use[0].options.envName).toBe('legacy');
  });

  it('should warn for perf budget violations in development', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'development';
    const webpackConfig = await configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 250e3,
      hints: 'warning',
    });
  });

  it('does not warn for perf budget violations for legacy', async () => {
    expect.assertions(1);
    const webpackConfig = await configGenerator('legacy');
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 250e3,
      hints: false,
    });
  });

  it('should error for perf budget violations in production', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'production';
    const webpackConfig = await configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 250e3,
      hints: 'error',
    });
  });

  it('should accept a custom perf budget', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'production';
    getConfigOptions.mockReturnValueOnce({ performanceBudget: 4103, purgecss: {} });
    const webpackConfig = await configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 4103,
      maxEntrypointSize: 4103,
      hints: 'error',
    });
  });

  it('should define global.BROWSER to be true', async () => {
    expect.assertions(2);
    const webpackConfig = await configGenerator();
    expect(webpackConfig).toHaveProperty('plugins', expect.any(Array));
    expect(webpackConfig.plugins).toContainEqual({ definitions: { 'global.BROWSER': 'true' } });
  });

  it('should append holocronModule with name', async () => {
    expect.assertions(1);
    const { packageJson: { name } } = readPackageUpSync();
    const webpackConfig = await configGenerator();
    expect(webpackConfig.output.library).toBe(`holocronModule_${name.replace(/-/g, '_')}`);
  });
});
