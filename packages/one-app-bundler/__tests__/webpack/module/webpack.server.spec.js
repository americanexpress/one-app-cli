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

import webpackConfig from '../../../webpack/module/webpack.server.js';
import { validateWebpackConfig } from '../../../test-utils.js';

jest.mock('@americanexpress/one-app-dev-bundler', () => ({ BUNDLE_TYPES: { BROWSER: 'BROWSER_BUILD_TYPE', SERVER: 'SERVER_BUILD_TYPE' } }));

jest.spyOn(process, 'cwd').mockImplementation(() => __dirname.split('/__tests__')[0]);

jest.mock('../../../utils/getMetaUrl.mjs', () => () => 'metaUrlMock');

jest.mock('node:url', () => ({
  fileURLToPath: jest.fn((url) => `/mock/path/for/url/${url}`),
}));

jest.mock('read-package-up', () => ({
  readPackageUpSync: jest.fn(() => ({ packageJson: { name: '@americanexpress/one-app-bundler', version: '6.8.0' } })),
}));

describe('webpack/module.server', () => {
  it('should export valid webpack config', async () => {
    expect.assertions(1);
    await expect(async () => validateWebpackConfig(await webpackConfig)).not.toThrow();
  });

  it('should define global.BROWSER to be false', async () => {
    expect.assertions(2);
    expect(await webpackConfig).toHaveProperty('plugins', expect.any(Array));
    expect((await webpackConfig).plugins).toContainEqual({ definitions: { global: 'globalThis', 'global.BROWSER': 'false' } });
  });
});
