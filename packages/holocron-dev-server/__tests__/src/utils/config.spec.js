/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

import readPkgUp from 'read-pkg-up';
import { createConfig } from '../../../src';
import { getContextPath } from '../../../src/utils/paths';
import { createConfigurationContext } from '../../../src/utils/config';

jest.mock('read-pkg-up');

beforeAll(() => {
  jest.spyOn(process, 'cwd').mockImplementation(() => '/home');
});

describe('createConfig', () => {
  const hmrModuleMock = () => ({
    packageJson: {
      name: 'hmr',
      version: '1.0.0',
      'one-amex': {
        app: {
          compatibility: '^5.0.0',
        },
      },
    },
  });

  beforeAll(() => {
    readPkgUp.mockImplementation(hmrModuleMock);
  });

  it('creates a zero-config configuration using package.json "one-amex" key', async () => {
    const createConfigMock = await createConfig();
    expect(createConfigMock).toEqual({
      moduleName: 'hmr',
      modulePath: getContextPath(),
      moduleVersion: '1.0.0',
      modules: [
        {
          moduleName: 'hmr',
          moduleVersion: '1.0.0',
          modulePath: getContextPath(),
          externals: [],
          providedExternals: undefined,
          requiredExternals: undefined,
          environmentVariables: undefined,
          rootModule: true,
          src: '/static/modules/hmr/hmr.js',
        },
      ],
      externals: [],
      logLevel: 4,
      port: 4000,
      dockerImage: 'oneamex/one-app-dev:latest',
      rootModuleName: 'hmr',
      remoteModuleMapUrl: undefined,
      environmentVariables: undefined,
      openWhenReady: false,
      clientConfig: { errorReportingUrl: '/reports/error' },
      sourceMap: undefined,
      webpackConfigPath: undefined,
      performanceBudget: undefined,
      purgecss: undefined,
      serverAddress: 'http://localhost:4000/',
    });
  });

  it('creates a configuration from various keys on "one-amex" field', async () => {
    const rootMock = () => ({
      packageJson: {
        name: 'holocron-module',
        version: '1.0.0',
        'one-amex': {
          runner: {
            modules: ['.', '../another-module'],
            dockerImage: 'oneamex/one-app-dev:latest',
            rootModuleName: 'holocron-module',
            parrotMiddleware: './dev.middleware.js',
          },
        },
      },
    });
    const anotherModuleMock = () => ({
      packageJson: {
        name: 'another-module',
        version: '1.0.0',
        'one-amex': {
          runner: {
            modules: ['.', '../another-module'],
            dockerImage: 'oneamex/one-app-dev:latest',
            rootModuleName: 'holocron-module',
            parrotMiddleware: './dev.middleware.js',
          },
        },
      },
    });
    readPkgUp
      // initial load
      .mockImplementationOnce(rootMock)
      .mockImplementationOnce(rootMock)
      .mockImplementationOnce(anotherModuleMock);
    const createConfigMock = await createConfig();
    expect(createConfigMock).toMatchObject({
      clientConfig: {
        errorReportingUrl: '/reports/error',
      },
      dockerImage: 'oneamex/one-app-dev:latest',
      externals: [],
      logLevel: 4,
      moduleName: 'holocron-module',
      modulePath: '/home',
      moduleVersion: '1.0.0',
      modules: [
        {
          externals: [],
          moduleName: 'holocron-module',
          modulePath: '/home',
          moduleVersion: '1.0.0',
          rootModule: true,
          src: '/static/modules/holocron-module/holocron-module.js',
        },
        {
          externals: [],
          moduleName: 'another-module',
          modulePath: '/another-module',
          moduleVersion: '1.0.0',
          rootModule: false,
          src: '/static/modules/another-module/another-module.js',
        },
      ],
      openWhenReady: false,
      port: 4000,
      rootModuleName: 'holocron-module',
      serverAddress: 'http://localhost:4000/',
    });
  });
  it('creates a configuration from various keys on "one-amex" field, if module is not present', async () => {
    const rootMock = () => ({
      packageJson: {
        name: 'holocron-module',
        version: '1.0.0',
        'one-amex': {
          app: {
            compatibility: '^5.0.0',
          },
          runner: {
            modules: [],
            dockerImage: 'oneamex/one-app-dev:latest',
            rootModuleName: 'holocron-module',
            parrotMiddleware: './dev.middleware.js',
          },
        },
      },
    });
    readPkgUp.mockImplementationOnce(rootMock).mockImplementationOnce(rootMock);
    const createConfigMock = await createConfig();
    expect(createConfigMock).toMatchObject({
      clientConfig: {
        errorReportingUrl: '/reports/error',
      },
      dockerImage: 'oneamex/one-app-dev:latest',
      externals: [],
      logLevel: 4,
      moduleName: 'holocron-module',
      modulePath: '/home',
      moduleVersion: '1.0.0',
      modules: [
        {
          environmentVariables: undefined,
          externals: [],
          moduleName: 'holocron-module',
          modulePath: '/home',
          moduleVersion: '1.0.0',
          rootModule: true,
          src: '/static/modules/holocron-module/holocron-module.js',
          providedExternals: undefined,
          requiredExternals: undefined,
        },
      ],
      openWhenReady: false,
      port: 4000,
      rootModuleName: 'holocron-module',
      serverAddress: 'http://localhost:4000/',
    });
  });
  it('returns  undefined module config if the bundler options are not provided ', () => {
    expect(createConfigurationContext({
      bundler: undefined,
    })).toMatchObject({
      clientConfig: {
        errorReportingUrl: '/reports/error',
      },
      dockerImage: 'oneamex/one-app-dev:latest',
      externals: [],
      logLevel: 4,
      modules: [
        undefined,
      ],
      openWhenReady: false,
      port: 4000,
    });
  });
});
