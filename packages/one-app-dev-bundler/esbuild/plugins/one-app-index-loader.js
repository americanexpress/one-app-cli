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

import path from 'path';
import fs from 'fs';

import { readPackageUpSync } from 'read-pkg-up';
import HolocronModuleRegisterInjector from './one-app-index-loader-injectors/holocron-module-register-injector.js';
import ModuleMetadataInjector from './one-app-index-loader-injectors/module-metadata-injector.js';
import ProvidedExternalsInjector from './one-app-index-loader-injectors/provided-externals-injector.js';
import AppCompatibilityInjector from './one-app-index-loader-injectors/app-compatibility-injector.js';
import DevLiveReloaderInjector from './one-app-index-loader-injectors/dev-live-reloader-injector.js';

// This loader is responsible for injecting everything into the index file that needs to be there
// It is designed to be run against the index.js file of all modules for all bundles
// It is composed of a sequence of injectors
// Each injector is a class responsible for gathering static information in its constructor
// then injecting the correct code into the content if it is needed for that bundle

const oneAppIndexLoader = (options) => ({
  name: 'oneAppIndexLoader',
  setup(build) {
    const { packageJson, path: packageJsonPath } = readPackageUpSync();
    const injectorOptions = {
      packageJson,
      ...options,
    };

    const injectors = [
      new HolocronModuleRegisterInjector(injectorOptions),
      new ModuleMetadataInjector(injectorOptions),
      new ProvidedExternalsInjector(injectorOptions),
      new AppCompatibilityInjector(injectorOptions),
      new DevLiveReloaderInjector(injectorOptions),
    ];

    const packageRoot = packageJsonPath.replace('package.json', '');

    const filterRegex = new RegExp(path.join(packageRoot, 'src', 'index'));

    build.onLoad({ filter: filterRegex }, async (args) => {
      const initialContent = await fs.promises.readFile(args.path, 'utf8');
      const match = initialContent.match(/export\s+default\s+(\w+);$/m);

      if (!match) {
        throw new Error('one-app-bundler: Module must use `export default VariableName` syntax in index');
      }

      // implementation of an async compose since there isn't one to hand
      // calls all the injectors 'bottom up'
      const outputContent = await injectors.reduceRight(async (contentPromise, injector) => {
        const content = await contentPromise;

        // such that every injector can completely change anything (including the rootComponentName)
        // each loop needs to re-match the rootComponentName
        const nextMatch = content.match(/export\s+default\s+(\w+);$/m);

        if (!nextMatch) {
          throw new Error('one-app-bundler: One of the injectors removed the default export. This is a bug in the bundler. Please raise an issue.');
        }

        // any information that the injectors might need, that can only be determined at load time
        const dynamicData = {
          rootComponentName: nextMatch[1],
        };

        return injector.inject(content, dynamicData);
      }, Promise.resolve(initialContent));

      return {
        contents: outputContent,
        loader: 'jsx', // for the live module container
      };
    });
  },
});

export default oneAppIndexLoader;
