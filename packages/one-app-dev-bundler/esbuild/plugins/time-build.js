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

const timeBuild = ({ bundleName, watch }) => ({
  name: 'timeBuild',
  setup(build) {
    let startTime;

    build.onStart(() => {
      startTime = process.hrtime.bigint();
    });

    build.onEnd(async (result) => {
      // eslint-disable-next-line no-param-reassign -- esBuild wants you to mutate this param
      result.durationMs = Number((process.hrtime.bigint() - startTime) / BigInt(1000000));

      if (!watch) { // watch has its own logging
        console.log(`${bundleName} bundle built in ${result.durationMs}ms`);

        await fs.promises.writeFile(`.esbuild-stats.${bundleName}.json`, JSON.stringify({
          ...result.metafile.outputs,
          durationMs: result.durationMs,
        }));
      }

      return result;
    });
  },
});

export default timeBuild;
