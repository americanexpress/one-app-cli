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

/* eslint-disable prefer-arrow-callback, object-shorthand --
uglifyjs expects ES5, disable newer syntax/features */

const styleList = [];

// css-loader gets an array of [module.id, style string]
function push(s) {
  styleList.push(s);
}

function getFullSheet() {
  return styleList
    .map(function stylesEntry(s) { return s[1]; })
    .join('\n');
}

export default function getCssBase(/* useSourceMap */) {
  return {
    push: push,
    getFullSheet: getFullSheet,
  };
}

/* eslint-enable prefer-arrow-callback, object-shorthand -- disables require enables */
