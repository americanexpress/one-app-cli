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

import fs from 'fs';
import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';
import { getAggregatedStyles, emptyAggregatedStyles } from '../utils/server-style-aggregator.js';
import { BUNDLE_TYPES } from '../constants/enums.js';

const serverStylesDispatcher = ({ bundleType }) => ({
  name: 'serverStylesDispatcher',
  setup(build) {
    if (bundleType === BUNDLE_TYPES.SERVER) {
      build.onEnd(async (result) => {
        const fileNames = getJsFilenamesFromKeys(result.metafile.outputs);
        await Promise.all(fileNames.map(async (fileName) => {
          const initialContent = await fs.promises.readFile(fileName, 'utf8');
          const outputContent = `${initialContent}
    ;module.exports.ssrStyles = {
      getFullSheet: () => ${JSON.stringify(getAggregatedStyles())},
    };`;
          await fs.promises.writeFile(fileName, outputContent, 'utf8');
        }));
        emptyAggregatedStyles();
        return result;
      });
    }
  },

});

export default serverStylesDispatcher;
