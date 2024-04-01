/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

function createExpiringSet(timeout = 30e3) {
  const set = new Set();
  const timers = new Map();
  return {
    add(item) {
      set.add(item);
      timers.set(item, setTimeout(() => {
        set.delete(item);
        timers.delete(item);
      }, timeout));
    },
    has(item) {
      return set.has(item);
    },
    get size() {
      return set.size;
    },
    destroy() {
      timers.forEach((timer) => clearTimeout(timer));
      set.clear();
      timers.clear();
    },
  };
}

module.exports = createExpiringSet;
