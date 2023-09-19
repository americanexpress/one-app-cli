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
import getMetaUrl from '../../../utils/get-meta-url.mjs';

const dirname = path.dirname(fileURLToPath(getMetaUrl()));
// stringify handles win32 path slashes too
// so `C:\path\node_modules` doesn't turn into something with a newline
const cssBasePath = JSON.stringify(path.resolve(dirname, 'css-base.js'));

export default function indexStyleLoader(content) {
  return `
  ${content}
  __webpack_exports__.default.ssrStyles = require(${cssBasePath})['default']();
  `;
}
