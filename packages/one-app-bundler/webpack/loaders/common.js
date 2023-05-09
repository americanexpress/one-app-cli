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
const getConfigOptions = require('../../utils/getConfigOptions');

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

/* eslint-disable inclusive-language/use-inclusive-words --
config options for a third party library */
// transform strings deep and greedy parameters into regex
const reconcileSafeList = (safelist) => {
  if (!safelist || Array.isArray(safelist)) {
    return safelist;
  }
  const configOptionsReconciled = safelist;

  const greedy = safelist.greedy
    ? safelist.greedy.map((pattern) => new RegExp(pattern, 'i'))
    : [];
  configOptionsReconciled.greedy = greedy;
  const deep = safelist.deep
    ? safelist.deep.map((pattern) => new RegExp(pattern, 'i'))
    : [/:global$/];
  configOptionsReconciled.deep = deep;

  return configOptionsReconciled;
};

const purgeCssLoader = () => {
  const { purgecss } = getConfigOptions();
  const safelist = reconcileSafeList(purgecss.safelist);
  let aggregatedStandard = [];
  let safelistDeep = [/:global$/];
  // aggregate the various whitelist options if safelist is not present
  if (!safelist) {
    if (purgecss.whitelistPatterns) {
      console.warn('Purgecss: Using depreciated property whitelistPatterns');
      aggregatedStandard = [
        ...aggregatedStandard,
        ...purgecss.whitelistPatterns.map((pattern) => new RegExp(pattern, 'i')),
      ];
    }
    if (purgecss.whitelist) {
      console.warn('Purgecss: Using depreciated property whitelist');
      aggregatedStandard = [...aggregatedStandard, ...purgecss.whitelist];
    }
    if (purgecss.whitelistPatternsChildren) {
      console.warn('Purgecss: Using depreciated property whitelistPatternsChildren');

      safelistDeep = purgecss.whitelistPatternsChildren.map((pattern) => new RegExp(pattern, 'i'));
    }
  }
  /* eslint-enable inclusive-language/use-inclusive-words --
  re enable disabled */
  if (purgecss.disabled) return [];
  return [{
    loader: '@americanexpress/purgecss-loader',
    options: {
      paths: [path.join(packageRoot, 'src/**/*.{js,jsx}'), ...purgecss.paths || []],
      extractors: purgecss.extractors || [],
      fontFace: purgecss.fontFace || false,
      keyframes: purgecss.keyframes || false,
      variables: purgecss.keyframes || false,
      safelist: safelist || {
        standard: aggregatedStandard,
        deep: safelistDeep,
        greedy: [],
        keyframes: purgecss.keyframes || false,
        variables: purgecss.keyframes || false,
      },
      blocklist: purgecss.blocklist || [],
      //
    },
  }];
};

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
  purgeCssLoader,
  sassLoader,
  reconcileSafeList,
};
