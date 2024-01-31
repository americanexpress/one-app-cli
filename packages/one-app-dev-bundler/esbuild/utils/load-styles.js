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
import { compile as sassCompile } from 'sass';
import fs from 'node:fs';
import postcss from 'postcss';
import cssModules from 'postcss-modules';
import cssnano from 'cssnano';
import crypto from 'crypto';
import purgecss from './purgecss.js';
import getModulesBundlerConfig from './get-modules-bundler-config.js';
import { BUNDLE_TYPES } from '../constants/enums.js';
import { addStyle } from './server-style-aggregator.js';

// This function can generically take a css or scss file,
// and 'load it'. Meaning it can be called from either
// esbuild or webpack based bundlers.
const loadStyles = async ({
  path,
  cssModulesOptions,
  bundleType,
}) => {
  const {
    localsConvention = 'camelCaseOnly',
    generateScopedName,
  } = cssModulesOptions;

  let cssContent;
  if (path.endsWith('scss')) {
    cssContent = sassCompile(path, { loadPaths: ['./node_modules'] })
      .css
      .toString();
  } else {
    cssContent = await fs.promises.readFile(path, 'utf8');
  }

  // Generate the css modules information
  let cssModulesJSON = {};
  const purgecssConfig = getModulesBundlerConfig('purgecss') || {};
  const result = await postcss([
    (process.env.NODE_ENV === 'production' && !purgecssConfig.disabled) && purgecss(purgecssConfig),
    cssModules({
      localsConvention,
      generateScopedName,
      getJSON(_cssSourceFile, json) {
        cssModulesJSON = { ...json };
        return cssModulesJSON;
      },
    }),
    process.env.NODE_ENV === 'production' && cssnano({
      preset: 'default',
    }),
  ].filter(Boolean))
    .process(cssContent, {
      from: undefined,
      map: false,
    });

  const hash = crypto.createHash('sha256');
  hash.update(result.css);
  const digest = hash.copy()
    .digest('hex');

  let injectedCode = '';
  if (bundleType === BUNDLE_TYPES.BROWSER) {
    // For browsers generate code to inject this style into the head at runtime
    injectedCode = `\
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();`;
  } else {
    // For SSR, aggregate all styles, then inject them once at the end
    const isDependencyFile = path.indexOf('/node_modules/') >= 0;
    addStyle(digest, result.css, isDependencyFile);
  }

  // provide useful values to the importer of this file, most importantly, the classnames
  const jsContent = `\
const digest = '${digest}';
const css = \`${result.css}\`;
${injectedCode}
${Object.entries(cssModulesJSON)
    .map(([exportName, className]) => `export const ${exportName} = '${className}';`)
    .join('\n')}
export default { ${Object.keys(cssModulesJSON)
    .join(', ')} };
export { css, digest };`;
  return jsContent;
};

export default loadStyles;
