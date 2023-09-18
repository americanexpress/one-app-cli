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

import path from 'node:path';
import dartSass from 'sass';
import getConfigOptions from '../../utils/getConfigOptions.js';

const packageRoot = process.cwd();

export const cssLoader = ({ name = '', importLoaders = 2 } = {}) => ({
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
export const reconcileSafeList = (safelist) => ({
  ...safelist,
  greedy: safelist.greedy
    ? safelist.greedy.map((pattern) => new RegExp(pattern, 'i'))
    : [],
  deep: safelist.deep
    ? safelist.deep.map((pattern) => new RegExp(pattern, 'i'))
    : [/:global$/],
});
const reconcileAllowList = (purgecss) => {
  const aggregatedAllowList = { aggregatedStandard: [], safelistDeep: [/:global$/] };
  if (purgecss.whitelistPatterns) {
    console.warn('Purgecss: Using depreciated property whitelistPatterns');
    aggregatedAllowList.aggregatedStandard = [
      ...aggregatedAllowList.aggregatedStandard,
      ...purgecss.whitelistPatterns.map((pattern) => new RegExp(pattern, 'i')),
    ];
  }
  if (purgecss.whitelist) {
    console.warn('Purgecss: Using depreciated property whitelist');
    // eslint-disable-next-line max-len -- disable max length
    aggregatedAllowList.aggregatedStandard = [...aggregatedAllowList.aggregatedStandard, ...purgecss.whitelist];
  }
  if (purgecss.whitelistPatternsChildren) {
    console.warn('Purgecss: Using depreciated property whitelistPatternsChildren');

    aggregatedAllowList.safelistDeep = purgecss.whitelistPatternsChildren.map((pattern) => new RegExp(pattern, 'i'));
  }
  return aggregatedAllowList;
};

export const purgeCssLoader = () => {
  const { purgecss } = getConfigOptions();
  if (purgecss.disabled) return [];

  let aggregatedAllowList = { aggregatedStandard: [], safelistDeep: [/:global$/] };
  let { safelist } = purgecss;
  if (purgecss.safelist && !Array.isArray(purgecss.safelist)) {
    safelist = reconcileSafeList(purgecss.safelist);
  } else {
    // aggregate the various whitelist options if safelist is not present
    aggregatedAllowList = reconcileAllowList(purgecss);
  }

  return [{
    loader: '@americanexpress/purgecss-loader',
    options: {
      paths: [path.join(packageRoot, 'src/**/*.{js,jsx}'), ...purgecss.paths || []],
      extractors: purgecss.extractors || [],
      fontFace: purgecss.fontFace || false,
      keyframes: purgecss.keyframes || false,
      variables: purgecss.keyframes || false,
      safelist: safelist || {
        standard: aggregatedAllowList.aggregatedStandard,
        deep: aggregatedAllowList.safelistDeep,
        greedy: [],
        keyframes: purgecss.keyframes || false,
        variables: purgecss.keyframes || false,
      },
      blocklist: purgecss.blocklist || [],
      //
    },
  }];
};
/* eslint-enable inclusive-language/use-inclusive-words --
re enable disabled */

export const sassLoader = () => ({
  loader: 'sass-loader',
  options: {
    implementation: dartSass,
  },
});

export const babelLoader = (babelEnv) => ({
  loader: 'babel-loader',
  options: {
    extends: path.join(packageRoot, '.babelrc'),
    envName: babelEnv,
    cacheDirectory: path.join(packageRoot, '.build-cache'),
  },
});
