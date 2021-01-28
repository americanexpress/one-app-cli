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

jest.spyOn(process, 'cwd').mockImplementation(() => __dirname.split('/__tests__')[0]);

jest.mock('read-pkg-up', () => ({
  sync: jest.fn(() => ({ packageJson: { name: '@americanexpress/one-app-bundler', version: '6.8.0' } })),
}));

const webpackConfig = require('../../../webpack/module/webpack.server');
const { validateWebpackConfig } = require('../../../test-utils');

describe('webpack/module.server', () => {
  it('should export valid webpack config', () => validateWebpackConfig(webpackConfig));

  it('should define global.BROWSER to be false', () => {
    expect(webpackConfig).toHaveProperty('plugins', expect.any(Array));
    expect(webpackConfig.plugins).toContainEqual({ definitions: { 'global.BROWSER': 'false' } });
  });
});
