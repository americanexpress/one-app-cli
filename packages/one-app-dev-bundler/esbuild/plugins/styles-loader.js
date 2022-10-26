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

import sass from 'sass';
import postcss from 'postcss';
import cssModules from 'postcss-modules';
import crypto from 'crypto';
import fs from 'fs';
import cssnano from 'cssnano';
import purgecss from '../utils/purgecss.js';
import getModulesBundlerConfig from '../utils/get-modules-bundler-config.js';
import { BUNDLE_TYPES } from '../constants/enums.js';
import { addStyle } from '../utils/server-style-aggrigator.js';
// the styles loader currently supports
// scss to css conversion
// css module in the browser and server
// injecting styles into the document head in the browser
const stylesLoader = (cssModulesOptions = {}, { bundleType } = {}) => ({
  name: 'stylesLoader',
  setup(build) {
    const {
      localsConvention = 'camelCaseOnly',
      generateScopedName,
    } = cssModulesOptions;

    build.onLoad({ filter: /.s?css$/ }, async (args) => {
      // Compile scss to css
      let cssContent;
      if (args.path.endsWith('scss')) {
        cssContent = sass.compile(args.path, { loadPaths: ['./node_modules'] }).css.toString();
      } else {
        cssContent = await fs.promises.readFile(args.path, 'utf8');
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
      ].filter(Boolean)).process(cssContent, {
        from: undefined,
        map: false,
      });

      const hash = crypto.createHash('sha256');
      hash.update(args.path);
      const digest = hash.copy().digest('hex');

      const classNames = JSON.stringify(cssModulesJSON);

      let injectedCode = '';
      if (bundleType === BUNDLE_TYPES.BROWSER) {
        // For browsers generate code to inject this style into the head at runtime
        injectedCode = `
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();`;
      } else {
        // For SSR we are going to aggregate all styles, then inject them once at the end
        addStyle(result.css);
      }

      // provide useful values to the importer of this file, most importantly, the classnames
      const jsContent = `
const digest = '${digest}';
const css = \`${result.css}\`;
${injectedCode}
export default ${classNames};
export { css, digest };`;

      return {
        contents: jsContent,
        loader: 'js',
      };
    });
  },
});

export default stylesLoader;
