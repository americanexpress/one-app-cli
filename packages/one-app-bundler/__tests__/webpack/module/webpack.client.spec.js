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

/* eslint-disable global-require */
const { validateWebpackConfig } = require('../../../test-utils');
const getConfigOptions = require('../../../utils/getConfigOptions');
const configGenerator = require('../../../webpack/module/webpack.client');

jest.mock('../../../utils/getConfigOptions', () => jest.fn(() => ({ purgecss: {} })));

jest.spyOn(process, 'cwd').mockImplementation(() => __dirname.split('/__tests__')[0]);

describe('webpack/module.client', () => {
  let originalNodeEnv;
  beforeAll(() => { originalNodeEnv = process.env.NODE_ENV; });
  afterAll(() => { process.env.NODE_ENV = originalNodeEnv; });

  it('should export valid webpack config', () => {
    const webpackConfig = configGenerator();
    return validateWebpackConfig(webpackConfig);
  });

  it('should provide the envName to babel', () => {
    const modernWebpackConfig = configGenerator('modern');
    const legacyWebpackConfig = configGenerator('legacy');
    expect(modernWebpackConfig.module.rules[3].use[0].options.envName).toBe('modern');
    expect(legacyWebpackConfig.module.rules[3].use[0].options.envName).toBe('legacy');
  });

  it('should warn for perf budget violations in development', () => {
    process.env.NODE_ENV = 'development';
    const webpackConfig = configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 250e3,
      hints: 'warning',
    });
  });

  it('should error for perf budget violations in production', () => {
    process.env.NODE_ENV = 'production';
    const webpackConfig = configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 250e3,
      hints: 'error',
    });
  });

  it('should accept a custom perf budget', () => {
    process.env.NODE_ENV = 'production';
    getConfigOptions.mockReturnValueOnce({ performanceBudget: 4103, purgecss: {} });
    const webpackConfig = configGenerator();
    expect(webpackConfig.performance).toMatchObject({
      maxAssetSize: 4103,
      maxEntrypointSize: 4103,
      hints: 'error',
    });
  });
});
