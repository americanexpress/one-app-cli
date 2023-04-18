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

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const localeBundler = require('@americanexpress/one-app-locale-bundler');

const getConfigOptions = require('../utils/getConfigOptions');
const clientConfig = require('../webpack/module/webpack.client');
const serverConfig = require('../webpack/module/webpack.server');
const getWebpackCallback = require('./webpackCallback');
const bundleExternalFallbacks = require('./bundle-external-fallbacks');
const { watch } = require('../utils/getCliOptions')();

const modernClientConfig = clientConfig('modern');
const legacyClientConfig = clientConfig('legacy');

fs.writeFileSync(path.join(process.cwd(), 'bundle.integrity.manifest.json'), JSON.stringify({}));

localeBundler(watch);

webpack(serverConfig, getWebpackCallback('node', true));
webpack(modernClientConfig, getWebpackCallback('browser', true));

bundleExternalFallbacks();

if (!getConfigOptions().disableDevelopmentLegacyBundle) webpack(legacyClientConfig, getWebpackCallback('legacyBrowser', true));
