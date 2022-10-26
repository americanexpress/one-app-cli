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

import DevLiveReloaderInjector
  from '../../../../esbuild/plugins/one-app-index-loader-injectors/dev-live-reloader-injector';
import { BUNDLE_TYPES } from '../../../../esbuild/constants/enums.js';

describe('The DevLiveReloaderInjector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not inject in the browser if there is no default export to wrap', async () => {
    expect.assertions(1);
    const browserInjector = new DevLiveReloaderInjector({
      bundleType: BUNDLE_TYPES.BROWSER,
      watch: true,
      useLiveReload: true,
      packageJson: {
        name: 'module-name-mock',
      },
    });
    const mockContent = 'mockContent;';
    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });
    expect(finalContent).toBe(mockContent);
  });

  it('should not inject in the server', async () => {
    expect.assertions(1);
    const browserInjector = new DevLiveReloaderInjector({
      bundleType: BUNDLE_TYPES.SERVER,
      watch: true,
      useLiveReload: true,
      packageJson: {
        name: 'module-name-mock',
      },
    });
    const mockContent = 'export default rootComponentNameMock;';
    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });
    expect(finalContent).toBe(mockContent);
  });

  it('should not inject in the browser if we are not watching', async () => {
    expect.assertions(1);
    const browserInjector = new DevLiveReloaderInjector({
      bundleType: BUNDLE_TYPES.BROWSER,
      watch: false,
      useLiveReload: true,
      packageJson: {
        name: 'module-name-mock',
      },
    });
    const mockContent = 'export default rootComponentNameMock;';
    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });
    expect(finalContent).toBe(mockContent);
  });

  it('should not inject in the browser if we are not in LiveMode', async () => {
    expect.assertions(1);
    const browserInjector = new DevLiveReloaderInjector({
      bundleType: BUNDLE_TYPES.BROWSER,
      watch: true,
      useLiveReload: false,
      packageJson: {
        name: 'module-name-mock',
      },
    });
    const mockContent = 'export default rootComponentNameMock;';
    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });
    expect(finalContent).toBe(mockContent);
  });
});
