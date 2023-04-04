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

import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';
import getModulesWebpackConfig from '../utils/get-modules-webpack-config.js';
import { logErrors, logWarnings } from '../utils/colorful-logging.js';
import getModulesBundlerConfig from '../utils/get-modules-bundler-config.js';

const bToKb = (bytes) => Math.floor(bytes / 1024);

// TODO: Support code splitting to validate the entrypoint and all assets differently?
const bundleAssetSizeLimiter = ({ watch, severity }) => ({
  name: 'bundleAssetSizeLimiter',
  setup(build) {
    build.onEnd(async (result) => {
      if (!result.metafile) {
        return result;
      }

      // get filenames and sizes of outputs in this build
      const fileNames = getJsFilenamesFromKeys(result.metafile.outputs);
      const sizes = fileNames.map((fileName) => result.metafile.outputs[fileName].bytes);

      let customAssetSize = getModulesBundlerConfig('maxAssetSize') || getModulesBundlerConfig('performanceBudget');

      // Todo: in future version of bundler, remove the lookup to the webpack config entirely
      if (!customAssetSize) {
        customAssetSize = getModulesWebpackConfig(['performance', 'maxAssetSize']);
      }

      const maxAssetSize = customAssetSize || 250e3;
      const maxEntrypointSize = customAssetSize || 250e3;

      // check for breaches. Log for non-watch dev builds. Error for all prod builds
      sizes.forEach((sizeInBytes, index) => {
        const messages = [];
        if (sizeInBytes > maxAssetSize) {
          messages.push(`${fileNames[index]} (${bToKb(sizeInBytes)}KB) is larger than the performance budget (${bToKb(maxAssetSize)}KB)`);
        }
        if (sizeInBytes > maxEntrypointSize) {
          messages.push(`${fileNames[index]} (${bToKb(sizeInBytes)}KB) is larger than the performance budget (${bToKb(maxEntrypointSize)}KB)`);
        }
        if (messages.length > 0) {
          if (severity === 'error') {
            logErrors(messages);

            throw new Error('Performance Limit Reached');
          } else if (!watch) {
            // eslint-disable-next-line no-param-reassign -- esBuild wants you to mutate this param
            result.messages = messages.map((s) => ({ text: s }));
            // esbuild doesn't print the returned warnings? maybe because this is an
            // onEnd hook
            logWarnings(messages);
          }
        }
      });

      return result;
    });
  },
});

export default bundleAssetSizeLimiter;
