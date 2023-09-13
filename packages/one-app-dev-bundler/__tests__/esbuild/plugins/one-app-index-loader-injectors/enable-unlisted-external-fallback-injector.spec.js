/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
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

import UnlistedExternalFallbackInjector
  from '../../../../esbuild/plugins/one-app-index-loader-injectors/enable-unlisted-external-fallback-injector';
import { BUNDLE_TYPES } from '../../../../esbuild/constants/enums.js';
import getModulesBundlerConfig from '../../../../esbuild/utils/get-modules-bundler-config.js';

jest.mock('../../../../esbuild/utils/get-modules-bundler-config.js', () => jest.fn());

describe('UnlistedExternalFallbackInjector', () => {
  describe('server targeted bundle', () => {
    it('adds enableUnlistedExternalFallbacks:false by default', async () => {
      // getModulesBundlerConfig.mockImplementationOnce(jest.fn());
      const serverInjector = new UnlistedExternalFallbackInjector(
        { bundleType: BUNDLE_TYPES.SERVER }
      );
      const mockedContent = 'mockedContent';
      const finalContent = await serverInjector.inject(mockedContent, { rootComponentName: 'rootComponentNameMock' });
      expect(finalContent).toMatchInlineSnapshot(`
"mockedContent
rootComponentNameMock.appConfig = Object.assign({}, rootComponentNameMock.appConfig, {
  enableUnlistedExternalFallbacks: \\"false\\",
});
"
`);
    });

    it('does not override enableUnlistedExternalFallbacks', async () => {
      getModulesBundlerConfig.mockImplementationOnce(() => true);
      const serverInjector = new UnlistedExternalFallbackInjector(
        { bundleType: BUNDLE_TYPES.SERVER }
      );
      const mockedContent = 'mockedContent';
      const finalContent = await serverInjector.inject(mockedContent, { rootComponentName: 'rootComponentNameMock' });
      expect(finalContent).toMatchInlineSnapshot(`
"mockedContent
rootComponentNameMock.appConfig = Object.assign({}, rootComponentNameMock.appConfig, {
  enableUnlistedExternalFallbacks: \\"true\\",
});
"
`);
    });
  });

  describe('browser targeted bundle', () => {
    it('does not include enableUnlistedExternalFallbacks', async () => {
      getModulesBundlerConfig.mockImplementationOnce(() => true);
      const browserInjector = new UnlistedExternalFallbackInjector(
        { bundleType: BUNDLE_TYPES.BROWSER }
      );
      const mockedContent = 'mockedContent';
      const finalContent = await browserInjector.inject(mockedContent, { rootComponentName: 'rootComponentNameMock' });
      expect(finalContent).toMatchInlineSnapshot('"mockedContent"');
    });
  });
});
