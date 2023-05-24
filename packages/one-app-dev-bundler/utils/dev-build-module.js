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
import localeBundler from '@americanexpress/one-app-locale-bundler';
import generateESBuildOptions from '../esbuild/generateESBuildOptions.js';
import getCliOptions from './get-cli-options.js';

const asyncLocaleBundler = async (watch) => localeBundler(watch);

export const devBuildModule = async () => {
  const {
    watch,
    useLiveReload,
  } = getCliOptions();

  const {
    browserConfig,
    nodeConfig,
  } = await generateESBuildOptions({ watch, useLiveReload });

  const builds = [
    esbuild.build(browserConfig),
    esbuild.build(nodeConfig),
    asyncLocaleBundler(watch),
  ];

  return Promise.all(builds).then(() => {
    if (watch) {
      console.log('Watching...');
    }
  });
};

export default devBuildModule;
