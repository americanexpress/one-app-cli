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

function objectToFlags(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    let kebabKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    if (key.includes('.')) {
      kebabKey = `${kebabKey.split('.')[0]}.${key.split('.')[1]}`;
    }
    const prefix = key.length === 1 ? '-' : '--';
    if (value === true) {
      return [...acc, `${prefix}${kebabKey}`];
    }
    if (value === false) {
      return [...acc, `--no-${kebabKey}`];
    }
    if (value !== undefined && value !== null && value !== '') {
      return [...acc, `${prefix}${kebabKey}=${value}`];
    }
    return acc;
  }, []);
}

module.exports = objectToFlags;
