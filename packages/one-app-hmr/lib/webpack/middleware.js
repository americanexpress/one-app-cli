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

import {
  createOneAppExternals,
} from './utility';
import { createDLLConfig } from './dll';
import { createHotModuleWebpackConfig } from './module';
import {
  error, warn, time, log, orange, dodgerblue,
} from '../logs';

export const printWebpack = (message) => `${dodgerblue('webpack')} - ${message}`;

export function buildExternalsDLL(config = {}) {
  const { externals = [] } = config;

  if (externals.length > 0 === false) return Promise.resolve();

  return new Promise((resolve, reject) => {
    webpack(createDLLConfig({
      isDev: false,
      dllVendors: externals,
      dllExternals: createOneAppExternals(),
    })).run((err, stats) => {
      if (err) {
        error(err);
        reject(err);
      }
      resolve(stats);
    });
  });
}

export async function loadWebpackMiddleware({
  context,
  publicPath,
  staticPath,
  modules,
  externals,
  rootModuleName,
} = {}) {
  log(printWebpack('initializing webpack'));

  await time(printWebpack(orange('pre-building dll externals for Holocron modules')), async () => {
    await buildExternalsDLL();
  });

  // TODO: consider building externals if changed
  const webpackConfig = createHotModuleWebpackConfig({
    context,
    publicPath,
    staticPath,
    modules,
    externals,
    rootModuleName,
  });
  const compiler = webpack(webpackConfig);
  const devMiddleware = webpackDevMiddleware(compiler, {
    index: false,
    serverSideRender: true,
    writeToDisk: true,
    logTime: false,
    logLevel: 'error',
    publicPath: webpackConfig.output.publicPath,
    watchOptions: {
      aggregateTimeout: 500,
      poll: 1000,
    },
    reporter: (opts, { state, stats } = {}) => {
      if (state && stats) {
        const { errors, warnings } = stats.compilation;
        errors.forEach((message) => error(message));
        warnings.forEach((message) => warn(message));
        log(printWebpack(`webpack built in ${orange(`${stats.endTime - stats.startTime}`)} ms`));
      } else {
        warn(printWebpack('webpack building...'));
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
    publish: (...args) => hotMiddleware.publish(...args),
  };
}
