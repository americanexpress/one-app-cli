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

import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { readPackageUpSync } from 'read-pkg-up';
import path from 'path';
import { BUNDLE_TYPES, SEVERITY } from './constants/enums.js';
import stylesLoader from './plugins/styles-loader.js';
import timeBuild from './plugins/time-build.js';
import bundleAssetSizeLimiter from './plugins/bundle-asset-size-limiter.js';
import externalsLoader from './plugins/externals-loader.js';
import oneAppIndexLoader from './plugins/one-app-index-loader.js';
import preventProdBuildsForNow from './plugins/prevent-prod-builds-for-now.js';
import getOneAppExternals from './constants/one-app-externals.js';
import cjsCompatibilityHotpatch from './plugins/cjs-compatibility-hotpatch.js';
import removeWebpackLoaderSyntax from './plugins/remove-webpack-loader-syntax.js';
import createWatchServerReloadFunction from './watch-server/watch-server.js';
import generateIntegrityManifest from './plugins/generate-integrity-manifest.js';
import fontLoader from './plugins/font-loader.js';
import imageLoader from './plugins/image-loader.js';
import legacyBundler from './plugins/legacy-bundler.js';
import restrictRuntimeSymbols from './plugins/restrict-runtime-symbols.js';
import serverStylesDispatcher from './plugins/server-styles-dispatcher.js';

const { browserGlobals, nodeExternals } = getOneAppExternals();

const generateESBuildOptions = async ({ watch, useLiveReload }) => {
  const { packageJson, path: packageJsonPath } = readPackageUpSync();
  const { version, name } = packageJson;
  const outFilePath = path.join(packageJsonPath.replace('package.json', 'build'), version);
  const isProd = process.env.NODE_ENV !== 'development';
  const severity = isProd ? SEVERITY.ERROR : SEVERITY.WARNING;

  const commonConfigPluginOptions = {
    watch,
    useLiveReload,
    severity,
  };

  // values core to every config
  const commonConfig = {
    metafile: true,
    entryPoints: ['./src/index.js'],
    bundle: true,
    treeShaking: true,
    minify: isProd,
    define: {
      'global.BROWSER': JSON.stringify(false),
    },
    plugins: [
      removeWebpackLoaderSyntax,
      preventProdBuildsForNow,
      bundleAssetSizeLimiter(commonConfigPluginOptions),
      imageLoader,
      fontLoader,
    ],
  };

  // config for browser builds
  const browserConfigPluginOptions = {
    ...commonConfigPluginOptions,
    bundleType: BUNDLE_TYPES.BROWSER,
  };
  const browserConfig = {
    ...commonConfig,
    outfile: `${outFilePath}/${name}.browser.js`,
    sourcemap: !isProd,
    target: ['chrome58', 'firefox57', 'safari11'], // TODO: pull this list from somewhere central
    plugins: [
      ...commonConfig.plugins,
      // TODO make these opt in, this would be a breaking change as webpack always includes them
      NodeGlobalsPolyfillPlugin({
        buffer: true,
      }),
      NodeModulesPolyfillPlugin(),
      bundleAssetSizeLimiter(commonConfigPluginOptions),
      externalsLoader(browserConfigPluginOptions),
      oneAppIndexLoader(browserConfigPluginOptions),
      globalExternals(browserGlobals),
      stylesLoader({}, browserConfigPluginOptions),
      legacyBundler(name),
      generateIntegrityManifest({ bundleName: 'browser' }),
      restrictRuntimeSymbols(browserConfigPluginOptions),
      serverStylesDispatcher(browserConfigPluginOptions),
      timeBuild({ bundleName: 'browser', watch }),
    ],
    define: {
      ...commonConfig.define,
      global: 'globalThis',
      'global.BROWSER': JSON.stringify(true),
    },
  };

  // config for node builds
  const nodeConfigPluginOptions = {
    ...commonConfigPluginOptions,
    bundleType: BUNDLE_TYPES.SERVER,
  };
  const nodeConfig = {
    ...commonConfig,
    platform: 'node',
    target: ['node12'], // TODO: pull this from somewhere central
    outfile: `${outFilePath}/${name}.node.js`,
    plugins: [
      ...commonConfig.plugins,
      externalsLoader(nodeConfigPluginOptions),
      oneAppIndexLoader(nodeConfigPluginOptions),
      cjsCompatibilityHotpatch,
      stylesLoader({}, nodeConfigPluginOptions),
      generateIntegrityManifest({ bundleName: 'node' }),
      restrictRuntimeSymbols(nodeConfigPluginOptions),
      serverStylesDispatcher(nodeConfigPluginOptions),
      timeBuild({ bundleName: 'node', watch }),
    ],
    external: nodeExternals,
  };

  if (watch) {
    let reloadBrowser;
    if (useLiveReload) {
      reloadBrowser = await createWatchServerReloadFunction({ portStart: 51993, portMax: 52993 });
    }

    const generateWatchConfig = (bundleName, shouldCauseReload = false) => (
      {
        onRebuild: (error, result) => {
          if (error) {
            console.error(`${bundleName} bundle failed, see above for reason`);
          } else {
            console.log(`${bundleName} bundle built in ${result.durationMs}ms`);
            if (shouldCauseReload) {
              reloadBrowser();
            }
          }
        },
      }
    );

    browserConfig.watch = generateWatchConfig('Browser', useLiveReload);
    nodeConfig.watch = generateWatchConfig('Server');
  }

  return {
    commonConfig,
    browserConfig,
    nodeConfig,
  };
};

export default generateESBuildOptions;
