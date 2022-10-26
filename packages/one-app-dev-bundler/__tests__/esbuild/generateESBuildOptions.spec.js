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

import createWatchServerReloadFunction from '../../esbuild/watch-server/watch-server';
import generateESBuildOptions from '../../esbuild/generateESBuildOptions';

jest.mock('../../esbuild/watch-server/watch-server.js', () => jest.fn());

// Some of the plugins return functions, some of them return objects directly
// for those that return functions, lets wrangle the parameters into a string
// so we can see them in the snapshot
jest.mock('../../esbuild/plugins/styles-loader.js', () => (...params) => `esbuild_plugin_for(styles-loader)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/server-styles-dispatcher.js', () => (...params) => `esbuild_plugin_for(server-styles-dispatcher)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/time-build.js', () => (...params) => `esbuild_plugin_for(time-build)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/bundle-asset-size-limiter.js', () => (...params) => `esbuild_plugin_for(bundle-asset-size-limiter)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/externals-loader.js', () => (...params) => `esbuild_plugin_for(externals-loader)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/one-app-index-loader.js', () => (...params) => `esbuild_plugin_for(one-app-index-loader)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/generate-integrity-manifest.js', () => (...params) => `esbuild_plugin_for(generate-integrity-manifest)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/legacy-bundler.js', () => (...params) => `esbuild_plugin_for(legacy-bundler)(${JSON.stringify(params)})`);
jest.mock('@fal-works/esbuild-plugin-global-externals', () => ({ globalExternals: (...params) => `esbuild_plugin_for(esbuild-plugin-global-externals)(${JSON.stringify(params)})` }));
jest.mock('@esbuild-plugins/node-globals-polyfill', () => ({ NodeGlobalsPolyfillPlugin: (...params) => `esbuild_plugin_for(node-globals-polyfill)(${JSON.stringify(params)})` }));
jest.mock('esbuild-plugin-svgr', () => (...params) => `esbuild_plugin_for(esbuild-plugin-svgr)(${JSON.stringify(params)})`);
jest.mock('../../esbuild/plugins/restrict-runtime-symbols.js', () => (...params) => `esbuild_plugin_for(restrict-runtime-symbols)(${JSON.stringify(params)})`);

// these plugins return objects directly, no parameters to capture
jest.mock('../../esbuild/plugins/prevent-prod-builds-for-now.js', () => 'esbuild_plugin_for(prevent-prod-builds-for-now)');
jest.mock('../../esbuild/plugins/cjs-compatibility-hotpatch.js', () => 'esbuild_plugin_for(cjs-compatibility-hotpatch)');
jest.mock('../../esbuild/plugins/remove-webpack-loader-syntax.js', () => 'esbuild_plugin_for(remove-webpack-loader-syntax)');
jest.mock('../../esbuild/plugins/image-loader.js', () => 'esbuild_plugin_for(image-loader)');
jest.mock('../../esbuild/plugins/font-loader.js', () => 'esbuild_plugin_for(font-loader)');

// Make sure our Symbolic enums show up in our snapshots
jest.mock('../../esbuild/constants/enums.js', () => ({
  BUNDLE_TYPES: {
    BROWSER: 'SymbolMock(BROWSER)',
    SERVER: 'SymbolMock(SERVER)',
  },
  SEVERITY: {
    ERROR: 'SymbolMock(ERROR)',
    WARNING: 'SymbolMock(WARNING)',
  },
}));

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: () => ({
    packageJson: {
      name: 'packageNameMock',
      version: 'versionMock',
    },
    path: '/path/to/package/mock/package.json',
  }),
}));

jest.useFakeTimers();

jest.spyOn(console, 'log');
jest.spyOn(console, 'error');
jest.spyOn(global, 'setTimeout');

describe('The generateESBuildOptions function', () => {
  let oldEnv;
  let mockOptions;
  let mockReloadBrowsers;

  beforeEach(() => {
    jest.clearAllMocks();
    oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // we need to fix this for all tests since its different in jenkins.
    mockOptions = {
      watch: false,
      useLiveReload: false,
    };

    mockReloadBrowsers = jest.fn();
    createWatchServerReloadFunction.mockImplementation(() => mockReloadBrowsers);
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv;
  });

  it('should return the correct values for all build targets if we are not watching', async () => {
    expect.assertions(4);
    const configs = await generateESBuildOptions(mockOptions);
    // When assessing these snapshots ask yourself at-least the following questions:
    // Should my changes have impacted all three configs, just two, or only one?
    // Have I accidentally caused changes with potentially unknown effects, such as
    //     re-ordering plugins needlessly?
    // Have I affected the parameters of any plugins that I didnt intend to?
    // Are new plugins mocked to properly show the params they are passed. Are these params correct?
    expect(configs.browserConfig).toMatchSnapshot();
    expect(configs.nodeConfig).toMatchSnapshot();

    expect(console).not.toHaveLogs();
    expect(console).not.toHaveErrors();
  });

  it('should return the correct values for all build targets if we are watching', async () => {
    expect.assertions(4);
    const configs = await generateESBuildOptions({ ...mockOptions, watch: true });
    // As well as asking the questions from the previous test ask your self these questions:
    // Are these changes relevant to the 'watch' flow, which should be as performant as possible?
    expect(configs.browserConfig).toMatchSnapshot();
    expect(configs.nodeConfig).toMatchSnapshot();

    expect(console).not.toHaveLogs();
    expect(console).not.toHaveErrors();
  });

  it('should return the correct values for all build targets if we are on prod mode', async () => {
    expect.assertions(4);
    process.env.NODE_ENV = 'production';
    const configs = await generateESBuildOptions(mockOptions);
    // As well as asking the questions from the first test ask your self these questions:
    // Should these changes affect production builds, or are they for development only.
    // If your changes affect production builds, are you truly confident that they changes wont
    //     cause breaking changes in built one app modules?
    //     If they do, consider that this bundler change might require a one app major version?
    expect(configs.browserConfig).toMatchSnapshot();
    expect(configs.nodeConfig).toMatchSnapshot();

    expect(console).not.toHaveLogs();
    expect(console).not.toHaveErrors();
  });

  it('should return onRebuild function under the watch key if we are watching - Browser config', async () => {
    expect.assertions(6);
    const config = await generateESBuildOptions({ ...mockOptions, watch: true });
    const targetConfig = config.browserConfig;
    targetConfig.watch.onRebuild('error', null);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, 'Browser bundle failed, see above for reason');
    jest.clearAllMocks();
    targetConfig.watch.onRebuild(null, { durationMs: 'durationMsMock' });
    jest.runAllTimers();
    expect(createWatchServerReloadFunction).toHaveBeenCalledTimes(0);
    expect(mockReloadBrowsers).toHaveBeenCalledTimes(0);

    expect(console).toHaveLogs([
      'Browser bundle built in durationMsMockms',
    ]);
    expect(console).not.toHaveErrors();
  });

  it('should return onRebuild function that reloads the browsers if in Live Reload mode - Browser config', async () => {
    expect.assertions(7);
    const config = await generateESBuildOptions({
      ...mockOptions,
      watch: true,
      useLiveReload: true,
    });
    const targetConfig = config.browserConfig;
    targetConfig.watch.onRebuild('error', null);

    expect(createWatchServerReloadFunction).toHaveBeenCalledTimes(1);
    expect(createWatchServerReloadFunction).toHaveBeenCalledWith({
      portMax: 52993,
      portStart: 51993,
    });

    expect(console).not.toHaveLogs();
    expect(console).toHaveErrors([
      'Browser bundle failed, see above for reason',
    ]);

    jest.clearAllMocks();
    targetConfig.watch.onRebuild(null, { durationMs: 'durationMsMock' });
    jest.runAllTimers();
    expect(mockReloadBrowsers).toHaveBeenCalledTimes(1);

    expect(console).toHaveLogs([
      'Browser bundle built in durationMsMockms',
    ]);
    expect(console).not.toHaveErrors();
  });

  // The only part of this config that doesnt reduce to a string is the watching hooks.
  // Lets make sure they work too
  const bundleTargets = { browserConfig: 'Browser', nodeConfig: 'Server' };
  Object.keys(bundleTargets).forEach((bundleTarget) => {
    it(`should return onRebuild functions under the watch key if we are watching - ${bundleTarget}`, async () => {
      expect.assertions(4);
      const config = await generateESBuildOptions({ ...mockOptions, watch: true });
      const targetConfig = config[bundleTarget];

      targetConfig.watch.onRebuild('error', null);

      expect(console).not.toHaveLogs();
      expect(console).toHaveErrors([
        `${bundleTargets[bundleTarget]} bundle failed, see above for reason`,
      ]);

      jest.clearAllMocks();
      targetConfig.watch.onRebuild(null, { durationMs: 'durationMsMock' });

      expect(console).toHaveLogs([
        `${bundleTargets[bundleTarget]} bundle built in durationMsMockms`,
      ]);
      expect(console).not.toHaveErrors();
    });
  });
});
