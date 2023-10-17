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
import { fileURLToPath } from 'node:url';
import getMetaUrl from '../../../utils/getMetaUrl.mjs';

const dirname = path.dirname(fileURLToPath(getMetaUrl()));
// stringify handles win32 path slashes too
// so `C:\path\node_modules` doesn't turn into something with a newline
const cssBasePathString = JSON.stringify(path.resolve(dirname, '../webpack/loaders/ssr-css-loader/css-base.js'));

const CSS_LOADER_FINDER = /import ___CSS_LOADER_API_IMPORT___ from "[\w./]*\/css-loader\/dist\/runtime\/api.js";\n\s*___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___\((undefined|false|___CSS_LOADER_API_SOURCEMAP_IMPORT___|___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___)?\);/;

// The following two regex patterns split the above regex in two
// this is due to some UI libraries injecting their own vars between
// var ___CSS_LOADER_API_IMPORT___ and exports = ___CS_LOADER_API_IMPORT___
const CSS_RUNTIME_FINDER = /import ___CSS_LOADER_API_IMPORT___ from "[\w./]*\/css-loader\/dist\/runtime\/api.js";/;

const CSS_EXPORTS_FINDER = /___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___\((undefined|false|___CSS_LOADER_API_SOURCEMAP_IMPORT___|___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___)?\);/;

export default function ssrCssLoader(content) {
  if (!CSS_RUNTIME_FINDER.test(content) || !CSS_EXPORTS_FINDER.test(content)) {
    throw new Error(`could not find the css-loader in\n${content}`);
  }

  return content
    .replace(
      CSS_LOADER_FINDER,
      ''
    )
    .replace(
      '___CSS_LOADER_EXPORT___.push',
      `require(${cssBasePathString}).default().push`
    )
    .replace(
      '___CSS_LOADER_EXPORT___.locals =',
      '___CSS_LOADER_EXPORT___ ='
    );
}
