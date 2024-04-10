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

import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import { readPackageUpSync } from 'read-package-up';

import getWebpackCallback from './webpackCallback.js';
import clientConfig from '../webpack/externalFallbacks/webpack.client.js';
import serverConfig from '../webpack/externalFallbacks/webpack.server.js';
import { writeToModuleConfig } from '../utils/writeToModuleConfig.js';

/**
 * Transpiles Requires Externals as individual files.
 * It's completely independent from bundling module's code.
 */
export const bundleExternalFallbacks = async () => {
  const { packageJson } = readPackageUpSync();
  const { 'one-amex': { bundler = {} } = {} } = packageJson;
  const { requiredExternals } = bundler;

  let counter = 0;
  const max = requiredExternals.length * 2;

  const updateBundleIntegrityManifest = () => {
    counter += 1;

    if (counter < max) {
      return;
    }

    const integrityManifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'bundle.integrity.manifest.json'), 'utf-8'));
    const requiredExternalsData = requiredExternals.reduce((obj, externalName) => {
      const version = readPackageUpSync({
        cwd: path.resolve(process.cwd(), 'node_modules', externalName),
      })?.packageJson.version;
      const semanticRange = packageJson.dependencies[externalName];
      return {
        ...obj,
        [externalName]: {
          name: externalName,
          version,
          semanticRange,
          browserIntegrity: integrityManifest[`${externalName}.browser`],
          nodeIntegrity: integrityManifest[`${externalName}.node`],
        },
      };
    }, {});

    writeToModuleConfig({ requiredExternals: requiredExternalsData });
  };

  if (
    requiredExternals && Array.isArray(requiredExternals)
    && requiredExternals.length > 0
  ) {
    await Promise.all(requiredExternals.map(async (externalName) => {
      const externalVersion = readPackageUpSync({
        cwd: path.resolve(process.cwd(), 'node_modules', externalName),
      })?.packageJson.version;

      await webpack(await serverConfig(externalName), getWebpackCallback([externalName, 'node'].join('.'), true, updateBundleIntegrityManifest));
      await webpack(await clientConfig(externalName, externalVersion), getWebpackCallback([externalName, 'browser'].join('.'), true, updateBundleIntegrityManifest));
    }));
  }
};
