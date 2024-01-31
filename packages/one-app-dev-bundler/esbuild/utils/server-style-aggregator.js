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

let aggregatedStyles = {
  deps: [],
  local: [],
};

const sheetDigests = new Set();

export function addStyle(digest, css, isDependencyFile) {
  if (!sheetDigests.has(digest)) {
    sheetDigests.add(digest);

    aggregatedStyles[isDependencyFile ? 'deps' : 'local'].push({
      css,
      digest,
    });
  }
}

/**
 * Returns aggregated styles object from all parsed CSS files with dependencies listed first
 * @returns {string}
 */
export const getAggregatedStyles = () => JSON.stringify(
  [...aggregatedStyles.deps, ...aggregatedStyles.local]
);

export const emptyAggregatedStyles = () => {
  aggregatedStyles = {
    deps: [],
    local: [],
  };
  sheetDigests.clear();
};
