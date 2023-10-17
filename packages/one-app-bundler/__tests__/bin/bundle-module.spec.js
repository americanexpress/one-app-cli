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

/* eslint-disable global-require --
testing `on import` functionality needs 'require' in every tests */

jest.mock('@americanexpress/one-app-dev-bundler', () => ({
  devBuildModule: async () => undefined,
  bundleExternalFallbacks: async () => undefined,
}));

jest.mock('../../bin/webpack-bundle-module', () => ({
  webpackBundleModule: jest.fn(),
}));

jest.spyOn(console, 'info');

describe('bundle-module', () => {
  let argv;
  let nodeEnv;

  beforeAll(() => {
    ({ argv } = process);
    nodeEnv = process.env.NODE_ENV;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.mock('../../utils/getConfigOptions', () => jest.fn(() => ({ disableDevelopmentLegacyBundle: false })));
  });

  afterEach(() => {
    process.argv = argv;
    process.env.NODE_ENV = nodeEnv;
  });

  // bundleModule has async side effects, use this
  // to have expectations on the next cycle of the event loop
  const waitForNextEventLoopIteration = () => new Promise((resolve) => {
    setImmediate(() => {
      resolve();
    });
  });

  it('should call the webpack bundler with no args', async () => {
    process.argv = [];

    require('../../bin/bundle-module');
    await waitForNextEventLoopIteration();

    // Since this is testing on-require behaviour, and there is a dynamic import, it's not possible
    // to directly assert the correct bundler was called, so instead just assert that the
    // correct info log was produced
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('Running production bundler');
  });

  it('should call the dev bundler when passed --dev in NODE_ENV=development', async () => {
    process.argv = ['--dev'];
    process.env.NODE_ENV = 'development';

    require('../../bin/bundle-module');
    await waitForNextEventLoopIteration();

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('Running dev bundler');
  });

  it('should call the webpack bundler when passed --dev in NODE_ENV=production, and inform the user this has happened', async () => {
    process.argv = ['--dev'];
    process.env.NODE_ENV = 'production';

    require('../../bin/bundle-module');
    await waitForNextEventLoopIteration();

    expect(console.info).toHaveBeenCalledTimes(2);
    expect(console.info).toHaveBeenNthCalledWith(1, 'Ignoring `--dev` flag for NODE_ENV=production');
    expect(console.info).toHaveBeenNthCalledWith(2, 'Running production bundler');
  });
});

/* eslint-enable global-require -- disables require enables */
