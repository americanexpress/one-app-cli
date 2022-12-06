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

import { createRequire } from 'module';
import path from 'path';
import getModulesBundlerConfig from './get-modules-bundler-config.js';
import getMetaUrl from './get-meta-url.mjs';

// This function is for backwards compatibility. Once this bundler completely takes over
// it should be deprecated
const getModulesWebpackConfig = (keyArray) => {
  if (!Array.isArray(keyArray) || keyArray.length === 0) {
    throw new TypeError('You must provide a key array with at-least one string, general access to the webpack config is not supported');
  }

  // attempt to load the custom webpack config the same the webpack based bundler does
  const configPath = getModulesBundlerConfig('webpackConfigPath');

  if (typeof configPath !== 'string' || configPath === '') {
    return null;
  }

  const require = createRequire(getMetaUrl());
  // eslint-disable-next-line import/no-dynamic-require -- dynamic require is needed here here
  const config = require(`${path.join(process.cwd(), configPath)}`);

  return keyArray.reduce((nestedConfig, key) => nestedConfig && nestedConfig[key], config);
};

export default getModulesWebpackConfig;
