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

      // With the exception of non-module css files in node_modules, we want to use the default
      // localIdentName (returning null). For non-module css files in node_modules though, we will
      // return the localName of the class as-is (non-scoped).
      getLocalIdent: (loaderContext, localIdentName, localName) => {
        const { resourcePath } = loaderContext;
        if (!resourcePath.includes('node_modules') || resourcePath.endsWith('.module.css') || resourcePath.endsWith('.module.scss')) {
          return null;
        }
        return localName;
      },
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
