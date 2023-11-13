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

jest.mock('../../utils/validateNodeEnv');

describe('webpack/one-amex.base', () => {
  let nodeEnv;

  beforeAll(() => {
    nodeEnv = process.env.NODE_ENV;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;
  });

  it('should validate the NODE_ENV', async () => {
    expect.assertions(1);
    const validateNodeEnv = (await import('../../utils/validateNodeEnv.js')).default;
    await import('../../webpack/webpack.common.js').default;
    expect(validateNodeEnv).toHaveBeenCalled();
  });

  it('should add some plugins and set the profile and minimize flags to true', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'production';
    const webpackConfig = (await import('../../webpack/webpack.common.js')).default;
    expect(webpackConfig).toEqual({
      devtool: false,
      profile: true,
      externals: expect.any(Object),
      module: expect.any(Object),
      mode: 'production',
      plugins: expect.any(Array),
      optimization: {
        minimize: true,
        minimizer: expect.any(Array),
      },
    });
  });

  it('should enable source maps in development', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'development';
    const webpackConfig = (await import('../../webpack/webpack.common.js')).default;
    expect(webpackConfig).toEqual({
      devtool: 'source-map',
      profile: true,
      externals: expect.any(Object),
      module: expect.any(Object),
      mode: 'development',
      plugins: expect.any(Array),
      optimization: {
        minimize: false,
        minimizer: expect.any(Array),
      },
    });
  });

  it('should only include the EnvironmentPlugin in development', async () => {
    expect.assertions(2);
    process.env.NODE_ENV = 'development';
    const webpackConfig = (await import('../../webpack/webpack.common.js')).default;
    expect(webpackConfig.plugins).toHaveLength(2);
    expect(webpackConfig.plugins).toMatchSnapshot();
  });

  it('should add loader options plugin in production', async () => {
    expect.assertions(2);
    process.env.NODE_ENV = 'production';
    const webpackConfig = (await import('../../webpack/webpack.common.js')).default;
    expect(webpackConfig.plugins).toHaveLength(3);
    expect(webpackConfig.plugins).toMatchSnapshot();
  });
});
