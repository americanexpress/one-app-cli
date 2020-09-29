/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { createHotModuleWebpackConfig } from './module';
import {
  error, warn, log, orange,
} from '../logs';

// eslint-disable-next-line import/prefer-default-export
export function loadWebpackMiddleware({ modules, externals, entryModule } = {}) {
  const webpackConfig = createHotModuleWebpackConfig({ modules, externals, entryModule });
  const compiler = webpack(webpackConfig);
  const devMiddleware = webpackDevMiddleware(compiler, {
    index: false,
    serverSideRender: true,
    publicPath: webpackConfig.output.publicPath,
    writeToDisk: true,
    logLevel: 'error',
    logTime: false,
    watchOptions: {
      aggregateTimeout: 500,
      poll: 1000,
    },
    reporter: (opts, { state, stats } = {}) => {
      if (state && stats) {
        const { errors, warnings } = stats.compilation;
        errors.forEach((message) => error(message));
        warnings.forEach((message) => warn(message));
        log(`webpack built in ${orange(`${stats.endTime - stats.startTime}`)} ms`);
      } else {
        log('webpack building...');
      }
      return null;
    },
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    reload: false,
    log: false,
    dynamicPublicPath: false,
  });

  return {
    devMiddleware,
    hotMiddleware,
  };
}
