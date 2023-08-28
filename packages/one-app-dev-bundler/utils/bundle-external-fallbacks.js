/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
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
import { readPackageUpSync } from 'read-pkg-up';
import esbuild from 'esbuild';
import snakeCase from 'lodash.snakecase';
import generateESBuildOptions from '../esbuild/generateESBuildOptions.js';

const EXTERNAL_PREFIX = '__holocron_external';

const getExternalLibraryName = (name, version) => [EXTERNAL_PREFIX, snakeCase(name), version.replace(/[^\d.]+/g, '').replace(/\.+/g, '_')].filter(Boolean).join('__');

/**
 * Transpiles Requires Externals as individual files.
 * It's completely independent from bundling module's code.
 */
export const bundleExternalFallbacks = async () => {
  const { packageJson } = readPackageUpSync();
  const { 'one-amex': { bundler = {} } } = packageJson;
  const { requiredExternals } = bundler;

  if (
    requiredExternals && Array.isArray(requiredExternals)
    && requiredExternals.length > 0
  ) {
    console.info('Bundling External Fallbacks');

    const {
      buildExternalsConfig,
    } = await generateESBuildOptions({ watch: false, useLiveReload: false });

    await Promise.all(['browser', 'node'].map((env) => Promise.all(requiredExternals.map((externalName) => {
      const indexPath = path.resolve(process.cwd(), 'node_modules', externalName);
      const buildPath = path.resolve(process.cwd(), 'build', packageJson.version);
      const externalFilename = `${externalName}.${env}.js`;
      const outfile = path.resolve(buildPath, externalFilename);
      const version = readPackageUpSync({
        cwd: path.resolve(process.cwd(), 'node_modules', externalName),
      })?.packageJson.version;
      const envConfig = env === 'browser' ? {
        globalName: getExternalLibraryName(externalName, version),
      } : {};

      return esbuild.build({
        ...buildExternalsConfig(env, externalName),
        entryPoints: [indexPath],
        outfile,
        ...envConfig,
      }).then(() => {
        if (env === 'browser') {
          const content = fs.readFileSync(outfile, 'utf8');

          fs.writeFileSync(
            outfile,
            [
              content,
              `Holocron.registerExternal({ name: "${externalName}", version: "${version}", module: ${getExternalLibraryName(externalName, version)}});`,
            ].join('\n')
          );
        }
      }).catch((error) => {
        console.error(`Failed to build fallback for external ${externalName} for ${env}`, error);
      });
    }))
    ));
  }
};

export default bundleExternalFallbacks;
