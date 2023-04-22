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

import ProvidedExternalsInjector
  from '../../../../esbuild/plugins/one-app-index-loader-injectors/provided-externals-injector';
import getModulesBundlerConfig from '../../../../esbuild/utils/get-modules-bundler-config';
import { BUNDLE_TYPES } from '../../../../esbuild/constants/enums.js';

jest.mock('../../../../esbuild/utils/get-modules-bundler-config.js', () => jest.fn(() => ['mockProvidedExternal']));

jest.mock('../../../../esbuild/utils/get-meta-url.mjs', () => () => 'metaUrlMock');

jest.mock('module', () => ({
  createRequire: () => () => ({
    version: 'mockVersion',
  }),
}));

const packageJson = {
  name: 'packageNameMock',
};

describe('The ProvidedExternalsInjector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should inject the provided externals code in the browser if there are externals', async () => {
    expect.assertions(1);
    const browserInjector = new ProvidedExternalsInjector(
      { bundleType: BUNDLE_TYPES.BROWSER, packageJson }
    );
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toMatchInlineSnapshot(`
"mockContent;
rootComponentNameMock.appConfig = Object.assign({}, rootComponentNameMock.appConfig, {
  providedExternals: {
    'mockProvidedExternal': { version: 'mockVersion', module: require('mockProvidedExternal')},
  },
});

if(globalThis.getTenantRootModule === undefined || (globalThis.rootModuleName && globalThis.rootModuleName === 'packageNameMock')){
globalThis.getTenantRootModule = () => rootComponentNameMock;
globalThis.rootModuleName = 'packageNameMock';
}
"
`);
  });

  it('should inject nothing in the browser if there are no externals', async () => {
    expect.assertions(1);
    getModulesBundlerConfig.mockImplementationOnce(() => ({
      providedExternals: [],
    }));
    const browserInjector = new ProvidedExternalsInjector(
      { bundleType: BUNDLE_TYPES.BROWSER, packageJson }
    );
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toBe(mockContent);
  });

  it('should inject nothing in the browser if the externals key does not exist', async () => {
    expect.assertions(1);
    getModulesBundlerConfig.mockImplementationOnce(() => ({}));
    const browserInjector = new ProvidedExternalsInjector(
      { bundleType: BUNDLE_TYPES.BROWSER, packageJson }
    );
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toBe(mockContent);
  });

  it('should inject the provided externals code in the server if there are externals', async () => {
    expect.assertions(1);
    const browserInjector = new ProvidedExternalsInjector(
      { bundleType: BUNDLE_TYPES.SERVER, packageJson }
    );
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toMatchInlineSnapshot(`
"mockContent;
rootComponentNameMock.appConfig = Object.assign({}, rootComponentNameMock.appConfig, {
  providedExternals: {
    'mockProvidedExternal': { version: 'mockVersion', module: require('mockProvidedExternal')},
  },
});

if(global.getTenantRootModule === undefined || (global.rootModuleName && global.rootModuleName === 'packageNameMock')){
global.getTenantRootModule = () => rootComponentNameMock;
global.rootModuleName = 'packageNameMock';
}
"
`);
  });

  it('should inject nothing in the server if there are no externals', async () => {
    expect.assertions(1);
    getModulesBundlerConfig.mockImplementationOnce(() => ({
      providedExternals: [],
    }));
    const browserInjector = new ProvidedExternalsInjector(
      { bundleType: BUNDLE_TYPES.SERVER, packageJson }
    );
    const mockContent = 'mockContent';

    const finalContent = await browserInjector.inject(mockContent, { rootComponentName: 'rootComponentNameMock' });

    expect(finalContent).toBe(mockContent);
  });
});
