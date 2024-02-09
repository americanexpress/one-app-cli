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

import { loadStyles } from '@americanexpress/one-app-dev-bundler';
import { BUNDLE_TYPES } from '@americanexpress/one-app-dev-bundler/esbuild/constants/enums.js';
import unboundStylesLoader from '../../../webpack/loaders/styles-loader';

jest.mock('@americanexpress/one-app-dev-bundler', () => ({
  loadStyles: jest.fn(() => 'let mockJsContent = "helloMockContent"'),
}));

describe('styles-loader', () => {
  let mockGetOptions;
  let stylesLoader;
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOptions = jest.fn(() => ({
      cssModulesOptions: {},
      bundleType: BUNDLE_TYPES.BROWSER,
    }));

    stylesLoader = unboundStylesLoader.bind({
      resourcePath: 'style/path/mock.scss',
      getOptions: mockGetOptions,
    });
  });
  it('should call the loadStyles util with the correct params, for non-node_modules', () => {
    expect(stylesLoader()).toBe('let mockJsContent = "helloMockContent"');
    expect(loadStyles).toHaveBeenCalledTimes(1);
    expect(loadStyles).toHaveBeenCalledWith({ bundleType: BUNDLE_TYPES.BROWSER, cssModulesOptions: { generateScopedName: undefined }, path: 'style/path/mock.scss' });
  });
  it('should call the loadStyles util with the correct params, for node_modules', () => {
    stylesLoader = unboundStylesLoader.bind({
      resourcePath: 'node_modules/style/path/mock.scss',
      getOptions: mockGetOptions,
    });

    expect(stylesLoader()).toBe('let mockJsContent = "helloMockContent"');

    expect(loadStyles).toHaveBeenCalledTimes(1);
    expect(loadStyles).toHaveBeenCalledWith({ bundleType: BUNDLE_TYPES.BROWSER, cssModulesOptions: { generateScopedName: '[local]' }, path: 'node_modules/style/path/mock.scss' });
  });
});
