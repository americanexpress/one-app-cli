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

// stringify handles win32 path slashes too
// so `C:\path\node_modules` doesn't turn into something with a newline
const cssBasePathString = JSON.stringify(path.resolve(__dirname, 'css-base.js'));

const CSS_LOADER_FINDER = /var ___CSS_LOADER_API_IMPORT___ = (__webpack_){0,1}require(__){0,1}\([.a-zA-Z0-9/_*!\s-]*"[.a-zA-Z0-9/_]+\/css-loader\/dist\/runtime\/api.js"\);\n\s*exports = ___CSS_LOADER_API_IMPORT___\((undefined|false)?\);/;

// The following two regex patterns split the above regex in two
// this is due to some UI libraries injecting their own vars between
// var ___CSS_LOADER_API_IMPORT___ and exports = ___CS_LOADER_API_IMPORT___
const CSS_RUNTIME_FINDER = /var ___CSS_LOADER_API_IMPORT___ = (__webpack_){0,1}require(__){0,1}\([.a-zA-Z0-9/_*!\s-]*"[.a-zA-Z0-9/_]+\/css-loader\/dist\/runtime\/api.js"\);/;

const CSS_EXPORTS_FINDER = /exports = ___CSS_LOADER_API_IMPORT___\((undefined|false)?\);/;

module.exports = function ssrCssLoader(content) {
  if (!CSS_RUNTIME_FINDER.test(content) || !CSS_EXPORTS_FINDER.test(content)) {
    throw new Error(`could not find the css-loader in\n${content}`);
  }

  return content
    .replace(
      CSS_LOADER_FINDER,
      ''
    )
    .replace(
      'exports.push',
      `require(${cssBasePathString})().push`
    )
    .replace(
      'exports.locals =',
      'exports = module.exports ='
    );
};
