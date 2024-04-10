/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

import path from 'node:path';
import { validateWebpackConfig } from '../../../test-utils.js';
import webpackClientConfig from '../../../webpack/externalFallbacks/webpack.client.js';

jest.mock('@americanexpress/one-app-dev-bundler', () => ({ BUNDLE_TYPES: { BROWSER: 'BROWSER_BUILD_TYPE', SERVER: 'SERVER_BUILD_TYPE' } }));

jest.spyOn(process, 'cwd').mockImplementation(() => __dirname.split(`${path.sep}__tests__`)[0]);

jest.mock('node:url', () => ({
  fileURLToPath: jest.fn((url) => `/mock/path/for/url/${url}`),
}));

// Mock out create resolver to return a mock path for the webpack 4 pollyfill resolves.
jest.mock('../../../webpack/createResolver.js', () => jest.fn(() => jest.fn((request) => `/mock/path/for/request/${request}`)));

jest.mock('read-package-up', () => ({
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
    const webpackConfig = await webpackClientConfig('external-a', '1.2.3');
    expect(() => validateWebpackConfig(webpackConfig)).not.toThrow();
  });

  it('should generate full list of fall backs', async () => {
    expect.assertions(2);
    const webpackConfig = await webpackClientConfig('external-a', '1.2.3');
    expect(() => validateWebpackConfig(webpackConfig)).not.toThrow();
    expect(webpackConfig.resolve.fallback).toMatchSnapshot();
  });

  it('should define global.BROWSER to be true', async () => {
    expect.assertions(2);
    const webpackConfig = await webpackClientConfig('external-a', '1.2.3');
    expect(webpackConfig).toHaveProperty('plugins', expect.any(Array));
    expect(webpackConfig.plugins).toContainEqual({ definitions: { global: 'globalThis', 'global.BROWSER': 'true' } });
  });

  it('should append holocronModule with name', async () => {
    expect.assertions(1);
    const webpackConfig = await webpackClientConfig('external-a', '1.2.3');
    expect(webpackConfig.output.library).toBe('__holocron_external__external_a__1_2_3');
  });
});
