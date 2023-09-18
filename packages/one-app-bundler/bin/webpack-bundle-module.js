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

import webpack from 'webpack';
import path from 'node:path';
import fs from 'node:fs';
import localeBundler from '@americanexpress/one-app-locale-bundler';
import getConfigOptions from '../utils/getConfigOptions.js';
import getWebpackCallback from './webpackCallback.js';
import utils from '../utils/getCliOptions.js';
import clientConfig from '../webpack/module/webpack.client.js';
import serverConfig from '../webpack/module/webpack.server.js';

const { watch } = utils();

const modernClientConfig = clientConfig('modern');
const legacyClientConfig = clientConfig('legacy');

fs.writeFileSync(path.join(process.cwd(), 'bundle.integrity.manifest.json'), JSON.stringify({}));

localeBundler(watch);

webpack(serverConfig, getWebpackCallback('node', true));
webpack(modernClientConfig, getWebpackCallback('browser', true));

if (!getConfigOptions().disableDevelopmentLegacyBundle) webpack(legacyClientConfig, getWebpackCallback('legacyBrowser', true));
