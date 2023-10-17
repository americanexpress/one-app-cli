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

import { readPackageUpSync } from 'read-pkg-up';
import constants from '../../index.js';

const { META_DATA_KEY } = constants;

function metaDataLoader(content) {
  const { packageJson: { version } } = readPackageUpSync();
  const match = content.match(/export\s+default\s+(?!from)(\w+);$/m);

  if (match) {
    return `${content};

${match[1]}.${META_DATA_KEY} = {
  version: '${version}',
};`;
  }

  throw new Error('one-app-bundler: Module must use `export default VariableName` syntax in index');
}

export default metaDataLoader;
