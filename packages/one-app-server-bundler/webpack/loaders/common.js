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

const path = require('node:path');
const dartSass = require('sass');

const packageRoot = process.cwd();

const cssLoader = ({ name = '', importLoaders = 2 } = {}) => ({
  loader: 'css-loader',
  options: {
    importLoaders,
    modules: {
      localIdentName: `${name && `${name}__`}[name]__[local]___[hash:base64:5]`,
      // getLocalIdent is a function that allows you to specify a function to generate the classname
      // The documentation can be found here:
      // https://github.com/webpack-contrib/css-loader#getlocalident

      // The below function returns the classnames as is if the resourcePath includes node_modules
      // if it doesn't it returns null allowing localIdentName to define the classname
      getLocalIdent: (loaderContext, localIdentName, localName) => (
        loaderContext.resourcePath.includes('node_modules') ? localName : null
      ),
    },
  },
});

const sassLoader = () => ({
  loader: 'sass-loader',
  options: {
    implementation: dartSass,
  },
});

const babelLoader = (babelEnv) => ({
  loader: 'babel-loader',
  options: {
    extends: path.join(packageRoot, '.babelrc'),
    envName: babelEnv,
    cacheDirectory: path.join(packageRoot, '.build-cache'),
  },
});

module.exports = {
  babelLoader,
  cssLoader,
  sassLoader,
};
