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

import esbuild from 'esbuild';
import { readPackageUpSync } from 'read-pkg-up';
import writeToModuleConfig from '../../utils/write-to-module-config';
import { bundleExternalFallbacks } from '../../utils/bundle-external-fallbacks.js';

jest.mock('esbuild', () => ({
  build: jest.fn(() => Promise.resolve({
    metafile: {
      outputs: {
        'build/1.0.0/root-module.node.js': {
          bytes: 5955,
        },
      },
    },
  })),
}));

jest.mock('../../esbuild/generateESBuildOptions', () => jest.fn(() => ({
  buildExternalsConfig: (env) => ({
    mocked: env,
  }),
})));

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: jest.fn(() => ({
    packageJson: {
      dependencies: {},
    },
  })),
}));

// mock reading integrity manifest
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify({
    'awesome.browser': 'sha-awesome-browser',
    'awesome.node': 'sha-awesome-node',
    node: 'shaNode',
    browser: 'shaBrowser',
  })),
}));

jest.mock('../../utils/write-to-module-config');

jest.spyOn(process, 'cwd').mockImplementation(() => '/path/');

describe('bundle-external-fallbacks', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('no required externals', () => {
    it('does not have required externals', async () => {
      readPackageUpSync.mockImplementationOnce(() => ({
        packageJson: {
          'one-amex': {},
        },
      }));

      await bundleExternalFallbacks();

      expect(esbuild.build).not.toHaveBeenCalled();
    });

    it('required externals is not an array', async () => {
      readPackageUpSync.mockImplementationOnce(() => ({
        packageJson: {
          'one-amex': {
            bundler: {
              requiredExternals: {},
            },
          },
        },
      }));

      await bundleExternalFallbacks();

      expect(esbuild.build).not.toHaveBeenCalled();
    });

    it('required externals is an empty array', async () => {
      readPackageUpSync.mockImplementationOnce(() => ({
        packageJson: {
          'one-amex': {
            bundler: {
              requiredExternals: [],
            },
          },
        },
      }));

      await bundleExternalFallbacks();

      expect(esbuild.build).not.toHaveBeenCalled();
    });
  });

  it('bundles the external for browser and node environments', async () => {
    readPackageUpSync.mockImplementationOnce(() => ({
      packageJson: {
        version: '1.0.0',
        'one-amex': {
          bundler: {
            requiredExternals: ['awesome'],
          },
        },
        dependencies: {
          awesome: '^1.2.3',
        },
      },
    }));

    const readPackageUpSyncMock = jest.fn(() => ({
      packageJson: {
        version: '1.2.3',
      },
    }));

    readPackageUpSync.mockImplementationOnce(readPackageUpSyncMock);

    await bundleExternalFallbacks();

    expect(console.info).toHaveBeenCalledWith('Bundling External Fallbacks');
    expect(esbuild.build).toHaveBeenCalledTimes(2);
    expect(esbuild.build).toHaveBeenCalledWith({
      entryPoints: [
        '/path/node_modules/awesome',
      ],
      globalName: '__holocron_external__awesome__1_2_3',
      footer: {
        js: 'Holocron.registerExternal({ name: "awesome", version: "1.2.3", module: __holocron_external__awesome__1_2_3});',
      },
      mocked: 'browser',
      outfile: '/path/build/1.0.0/awesome.browser.js',
    });
    expect(esbuild.build).toHaveBeenCalledWith({
      entryPoints: [
        '/path/node_modules/awesome',
      ],
      footer: {},
      mocked: 'node',
      outfile: '/path/build/1.0.0/awesome.node.js',
    });
  });

  it('bundle fails', async () => {
    readPackageUpSync.mockImplementationOnce(() => ({
      packageJson: {
        version: '1.0.0',
        'one-amex': {
          bundler: {
            requiredExternals: ['awesome'],
          },
        },
        dependencies: {
          awesome: '^2.0.0',
        },
      },
    }));

    const readPackageUpSyncMock = jest.fn(() => ({
      packageJson: {
        version: '2.1.0',
      },
    }));

    readPackageUpSync.mockImplementationOnce(readPackageUpSyncMock);

    const error = new Error('Testing');

    esbuild.build.mockImplementation(() => Promise.reject(error));

    await bundleExternalFallbacks();

    expect(esbuild.build).toHaveBeenCalledTimes(2);
    expect(esbuild.build).toHaveBeenCalledWith({
      entryPoints: [
        '/path/node_modules/awesome',
      ],
      globalName: '__holocron_external__awesome__2_1_0',
      mocked: 'browser',
      footer: { js: 'Holocron.registerExternal({ name: "awesome", version: "2.1.0", module: __holocron_external__awesome__2_1_0});' },
      outfile: '/path/build/1.0.0/awesome.browser.js',
    });
    expect(esbuild.build).toHaveBeenCalledWith({
      entryPoints: [
        '/path/node_modules/awesome',
      ],
      mocked: 'node',
      footer: {},
      outfile: '/path/build/1.0.0/awesome.node.js',
    });

    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith('Failed to build fallback for external awesome for browser', error);
    expect(console.error).toHaveBeenCalledWith('Failed to build fallback for external awesome for node', error);
  });

  it('does not fail when no one-amex config', async () => {
    readPackageUpSync.mockImplementationOnce(() => ({
      packageJson: {},
    }));

    await bundleExternalFallbacks();
    expect(esbuild.build).not.toHaveBeenCalled();
  });

  it('writes to module config', async () => {
    readPackageUpSync.mockImplementationOnce(() => ({
      packageJson: {
        version: '1.0.0',
        'one-amex': {
          bundler: {
            requiredExternals: ['awesome'],
          },
        },
        dependencies: {
          awesome: '^1.2.3',
        },
      },
    }));

    readPackageUpSync.mockImplementation(() => ({
      packageJson: {
        version: '1.2.3',
      },
    }));

    await bundleExternalFallbacks();

    expect(writeToModuleConfig).toHaveBeenCalledWith({
      requiredExternals: {
        awesome: {
          name: 'awesome',
          version: '1.2.3',
          integrity: 'sha-awesome-browser',
          semanticRange: '^1.2.3',
          browserIntegrity: 'sha-awesome-browser',
          nodeIntegrity: 'sha-awesome-node',
        },
      },
    });
  });
});
