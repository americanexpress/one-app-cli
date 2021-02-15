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
import fs from 'fs';
import path from 'path';
import { getModuleConfig, createConfig } from '../../src/config';

jest.mock('read-pkg-up');
jest.mock('../../src/webpack/utility');
jest.mock('path');
jest.mock('fs');

describe('getModuleConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  readPkgUp.mockImplementation(() => ({
    packageJson: {
      name: 'hmr',
      version: '1.0.0',
      'one-amex': {
        app: {
          compatibility: '^5.0.0',
        },
        runner: {
          dockerImage: 'dockerproxy.aexp.com/oneamex/one-app-dev:latest',
          modules: [
            '.',
          ],
          rootModuleName: 'hmr',
          parrotMiddleware: './dev.middleware.js',
        },
      },
    },
  }));
  it('gets module configuration with module path provided', async () => {
    const moduleConfiguration = await getModuleConfig('test/path-to-modules');
    expect(moduleConfiguration.moduleName).toEqual('hmr');
  });
  it('gets module configuration without module path provided', async () => {
    const moduleConfiguration = await getModuleConfig();
    expect(moduleConfiguration.moduleName).toEqual('hmr');
  });
  it('returns empty object if one-amex key is missing', async () => {
    readPkgUp.mockImplementation(() => ({
      packageJson: {
        name: 'hmr',
        version: '1.0.0',
      },
    }));

    const moduleConfiguration = await getModuleConfig();
    expect(moduleConfiguration.modules.length).toEqual(0);
  });
  it('set modules to empty array if modules is not provided', async () => {
    readPkgUp.mockImplementation(() => ({
      packageJson: {
        name: 'hmr',
        version: '1.0.0',
        'one-amex': {
          app: {
            compatibility: '^5.0.0',
          },
          runner: {
            dockerImage: 'dockerproxy.aexp.com/oneamex/one-app-dev:latest',
            rootModuleName: 'hmr',
            parrotMiddleware: './dev.middleware.js',
          },
        },
      },
    }));

    const moduleConfiguration = await getModuleConfig();
    expect(moduleConfiguration.modules.length).toEqual(0);
  });
  it('returns the language packs configured', async () => {
    path.resolve.mockReturnValue('/modules/locales');
    fs.existsSync = jest.fn(() => true);
    const moduleConfiguration = await getModuleConfig();
    expect(moduleConfiguration.languagePacks.length).toEqual(1);
  });
  it('returns the scenarios configured', async () => {
    path.resolve.mockReturnValue('/mock/scenarios.js');
    fs.existsSync = jest.fn(() => true);
    const moduleConfiguration = await getModuleConfig();
    expect(moduleConfiguration.scenarios[0]).toEqual('/mock/scenarios.js');
  });
  it('creates a configuration', async () => {
    const createConfigMock = await createConfig();
    expect(createConfigMock.rootModule).toEqual('root-module');
  });
});
