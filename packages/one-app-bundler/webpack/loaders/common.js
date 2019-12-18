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

const path = require('path');
const dartSass = require('sass');
const Fiber = require('fibers');
const getConfigOptions = require('../../utils/getConfigOptions');

const packageRoot = process.cwd();

const cssLoader = ({ name = '' } = {}) => ({
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: `${name && `${name}__`}[name]__[local]___[hash:base64:5]`,
    },
  },
});

const purgeCssLoader = () => {
  const configOptions = getConfigOptions();
  if (configOptions.purgecss.disabled) return [];
  return [{
    loader: '@americanexpress/purgecss-loader',
    options: {
      paths: [path.join(packageRoot, 'src/**/*.{js,jsx}'), ...(configOptions.purgecss.paths || [])],
    },
  }];
};

const sassLoader = () => ({
  loader: 'sass-loader',
  options: {
    implementation: dartSass,
    sassOptions: {
      fiber: Fiber,
    },
  },
});

const babelLoader = (babelEnv) => ({
  loader: 'babel-loader',
  options: {
    extends: path.join(packageRoot, '.babelrc'),
    envName: babelEnv,
  },
});

module.exports = {
  babelLoader,
  cssLoader,
  purgeCssLoader,
  sassLoader,
};
