/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

import webpack from 'webpack';
import path from 'node:path';
import { merge } from 'webpack-merge';
import { readPackageUpSync } from 'read-package-up';
import { SubresourceIntegrityPlugin as SriPlugin } from 'webpack-subresource-integrity';
import { BUNDLE_TYPES } from '@americanexpress/one-app-dev-bundler';

import commonConfig from '../webpack.common.js';
import {
  babelLoader,
} from '../loaders/common.js';
import createResolver from '../createResolver.js';
import { ExternalRegisterPlugin } from '../plugins/register-external-injector.js';
import { getExternalLibraryName } from '../../utils/getExternalLibraryName.js';

const MAIN_FIELDS = ['browser', 'module', 'main'];

const resolve = createResolver({ mainFields: MAIN_FIELDS });
const packageRoot = process.cwd();
const { packageJson } = readPackageUpSync();
const { version } = packageJson;

const webpackClient = async (externalName, externalVersion) => {
  const indexPath = path.resolve(process.cwd(), 'node_modules', externalName);

  const config = merge(
    commonConfig,
    {
      entry: path.resolve(indexPath),
      output: {
        crossOriginLoading: 'anonymous',
        path: path.join(packageRoot, 'build', version),
        filename: `${externalName}.browser.js`,
        chunkFilename: '[name].chunk.browser.js',
        library: getExternalLibraryName(externalName, externalVersion),
      },
      resolve: {
        mainFields: MAIN_FIELDS,
        modules: [packageRoot, 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
          assert: resolve('assert'),
          buffer: resolve('buffer'),
          console: resolve('console-browserify'),
          constants: resolve('constants-browserify'),
          crypto: resolve('crypto-browserify'),
          domain: resolve('domain-browser'),
          events: resolve('events'),
          http: resolve('stream-http'),
          https: resolve('https-browserify'),
          os: resolve('os-browserify/browser'),
          path: resolve('path-browserify'),
          punycode: resolve('punycode'),
          process: resolve('process/browser'),
          querystring: resolve('querystring-es3'),
          stream: resolve('stream-browserify'),
          string_decoder: resolve('string_decoder'),
          sys: resolve('util'),
          timers: resolve('timers-browserify'),
          tty: resolve('tty-browserify'),
          url: resolve('url'),
          util: resolve('util'),
          vm: resolve('vm-browserify'),
          zlib: resolve('browserify-zlib'),
        },
      },
      module: {
        rules: [
          {
            test: /[jt]sx?$/,
            include: [path.join(packageRoot, 'src'), path.join(packageRoot, 'node_modules')],
            use: [babelLoader('modern')],
          },
          {
            test: /\.(sa|sc|c)ss$/,
            use: [
              {
                loader: '@americanexpress/one-app-bundler/webpack/loaders/styles-loader',
                options: {
                  cssModulesOptions: {},
                  bundleType: BUNDLE_TYPES.BROWSER,
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new ExternalRegisterPlugin(
          externalName,
          externalVersion
        ),
        new webpack.DefinePlugin({
          'global.BROWSER': JSON.stringify(true),
          global: 'globalThis',
        }),
        new SriPlugin({
          hashFuncNames: ['sha256', 'sha384'],
          enabled: true,
        }),
      ],
    }
  );

  return config;
};

export default webpackClient;
