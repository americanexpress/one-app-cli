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

const fontLoader = {
  name: 'fontLoader',
  setup(build) {
    build.onLoad({ filter: /\.(ttf|woff2?|jfproj)$/i }, async (args) => {
      const dataurl = await fs.promises.readFile(args.path, 'base64');
      const fileType = args.path.split('.').pop();
      const jsContent = `module.exports = "data:font/${fileType};base64,${dataurl}"`;
      return {
        contents: jsContent,
        loader: 'js',
      };
    });
  },
};

export default fontLoader;
