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
import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';

// TODO: (When this bundler is being assessed for production bundling use)
// This plugin is overwriting the module.exports that esbuild naturally outputs on the server
// src_default is reliably the default export from a modules `src/index.js` file,
// which _must_ exist for the rest of this bundler to work
// That said, if esbuild changes how it names variables this _won't work_
// This also _might not_ work for production builds
const cjsCompatibilityHotpatch = {
  name: 'cjsCompatibilityHotpatch',
  setup(build) {
    build.onEnd(async (result) => {
      if (!result.metafile) {
        return result;
      }
      const fileNames = getJsFilenamesFromKeys(result.metafile.outputs);
      await Promise.all(fileNames.map(async (fileName) => {
        const initialContent = await fs.promises.readFile(fileName, 'utf8');
        const outputContent = `${initialContent}
;module.exports = src_default;`;
        await fs.promises.writeFile(fileName, outputContent, 'utf8');
      }));
      return result;
    });
  },
};

export default cjsCompatibilityHotpatch;
