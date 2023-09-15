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

import fs from 'node:fs';
import path from 'node:path';
import glob from 'glob-all';
import postcssPurgeCSS from '@fullhuman/postcss-purgecss';

// Get the content of all JSX files and cache it since reading files is expensive
const globCache = {};
const getJSXcontent = (globPath) => {
  if (!globCache[globPath]) {
    globCache[globPath] = glob
      .sync(
        globPath,
        { nodir: true }
      )
      .map((filePath) => fs.readFileSync(filePath, 'utf-8'))
      .map((raw) => ({ raw, extension: 'js' }));
  }

  return globCache[globPath];
};

const purgecss = (config = {}) => postcssPurgeCSS({
  ...config,
  content: getJSXcontent(
    config.paths
            || config.content
            || path.join(process.cwd(), 'src', '**', '*.jsx')
  ),
});

export default purgecss;
