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

import { loadStyles } from '@americanexpress/one-app-dev-bundler';

function stylesLoader() {
  const options = { ...this.getOptions() };
  options.cssModulesOptions.generateScopedName = this.resourcePath.includes('node_modules') ? '[local]' : '[local]_[hash:base64:5]';
  return loadStyles({ path: this.resourcePath, ...options });
}

export default stylesLoader;
