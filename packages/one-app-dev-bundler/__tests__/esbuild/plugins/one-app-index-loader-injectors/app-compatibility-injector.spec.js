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

import AppCompatibilityInjector
  from '../../../../esbuild/plugins/one-app-index-loader-injectors/app-compatibility-injector';
import { BUNDLE_TYPES } from '../../../../esbuild/constants/enums.js';

jest.mock('../../../../esbuild/utils/get-app-compatibility.js', () => () => 'appCompatibilityMock');

describe('The AppCompatibilityInjector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should inject nothing in the browser', async () => {
    expect.assertions(1);
    const browserInjector = new AppCompatibilityInjector({
      bundleType: BUNDLE_TYPES.BROWSER,
      packageJson: {
        name: 'packageNameMock',
      },
    });
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toBe(mockContent);
  });

  it('should inject app compatibility values from the package.json', async () => {
    expect.assertions(1);
    const serverInjector = new AppCompatibilityInjector({
      bundleType: BUNDLE_TYPES.SERVER,
      packageJson: {
        name: 'packageNameMock',
      },
    });
    const mockContent = 'mockContent';

    const finalContent = await serverInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toMatchInlineSnapshot(`
"mockContent
rootComponentNameMock.appConfig = Object.assign({}, rootComponentNameMock.appConfig, {
  appCompatibility: \\"appCompatibilityMock\\",
});
"
`);
  });
});
