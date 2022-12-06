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

import esbuild from 'esbuild';
import generateESBuildOptions from '../../esbuild/generateESBuildOptions.js';
import getCliOptions from '../../utils/get-cli-options.js';
import devBuildModule from '../../utils/dev-build-module.js';

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

jest.mock('@americanexpress/one-app-locale-bundler');

jest.mock('../../esbuild/generateESBuildOptions', () => jest.fn(() => ({
  browserConfig: 'mockBrowserConfig',
  nodeConfig: 'mockNodeConfig',
})));

// eslint-disable-next-line react/display-name -- eslint incorrectly thinks the next line is a react component
jest.mock('../../esbuild/utils/get-modules-bundler-config', () => () => null);

jest.mock('../../utils/get-cli-options', () => jest.fn(() => { }));

describe('bundle-module', () => {
  let mockOptions;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOptions = {
      watch: false,
      useLiveReload: false,
    };

    getCliOptions.mockImplementation(() => mockOptions);
  });

  it('should create a build for each build target, with watch and live off, and no bundler config', async () => {
    expect.assertions(5);

    await devBuildModule();

    expect(generateESBuildOptions).toHaveBeenCalledTimes(1);
    expect(generateESBuildOptions).toHaveBeenCalledWith({ watch: false, useLiveReload: false });

    expect(esbuild.build).toHaveBeenCalledTimes(2);
    expect(esbuild.build).toHaveBeenNthCalledWith(1, 'mockBrowserConfig');
    expect(esbuild.build).toHaveBeenNthCalledWith(2, 'mockNodeConfig');
  });

  it('should create a build for each build target, with watch on and live off, and no bundler config', async () => {
    expect.assertions(5);
    mockOptions.watch = true;

    await devBuildModule();

    expect(generateESBuildOptions).toHaveBeenCalledTimes(1);
    expect(generateESBuildOptions).toHaveBeenCalledWith({ watch: true, useLiveReload: false });

    expect(esbuild.build).toHaveBeenCalledTimes(2);
    expect(esbuild.build).toHaveBeenNthCalledWith(1, 'mockBrowserConfig');
    expect(esbuild.build).toHaveBeenNthCalledWith(2, 'mockNodeConfig');
  });

  it('should create a build for each build target, with watch and live on, and no bundler config', async () => {
    expect.assertions(5);
    mockOptions.watch = true;
    mockOptions.useLiveReload = true;

    await devBuildModule();

    expect(generateESBuildOptions).toHaveBeenCalledTimes(1);
    expect(generateESBuildOptions).toHaveBeenCalledWith({ watch: true, useLiveReload: true });

    expect(esbuild.build).toHaveBeenCalledTimes(2);
    expect(esbuild.build).toHaveBeenNthCalledWith(1, 'mockBrowserConfig');
    expect(esbuild.build).toHaveBeenNthCalledWith(2, 'mockNodeConfig');
  });
});
