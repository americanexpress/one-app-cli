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

import ssri from 'ssri';
import fs from 'node:fs';
import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';

// NOTE:: This needs to be synchronous to avoid race condition resulting in
// missing integrity manifest entries
function writeIntegrityFragment(bundleName, integrityString, fileName) {
  let integrityObject = {};
  try {
    integrityObject = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  } catch (e) {
    // empty catch in case file does not exist
  }

  integrityObject[bundleName] = integrityString;
  return fs.writeFileSync(fileName, JSON.stringify(integrityObject, null, 2));
}

const generateIntegrityManifest = ({ bundleName }) => ({
  name: 'generateIntegrityManifest',
  setup(build) {
    build.onEnd(async (result) => {
      if (!result.metafile) {
        return result;
      }
      // this boldly assumes there will be exactly 1 .js file emitted from the build
      const fileName = getJsFilenamesFromKeys(result.metafile.outputs)[0];

      const moduleString = await fs.promises.readFile(fileName, 'utf8');

      const integrityString = ssri.fromData(
        moduleString,
        { algorithms: ['sha256', 'sha384'] }
      ).toString();

      writeIntegrityFragment(bundleName, integrityString, './bundle.integrity.manifest.json');

      return result;
    });
  },
});

export default generateIntegrityManifest;
