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

const createExpiringSet = require('../../utils/expiringSet');

describe('createExpiringSet', () => {
  jest.useFakeTimers();

  it('should add an item to the set and remove it after the timeout', async () => {
    const expiringSet = createExpiringSet(1000);
    expiringSet.add('item');
    expect(expiringSet.has('item')).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(expiringSet.has('item')).toBe(false);
  });

  it('should should be destroyable without leaving any open handles', async () => {
    const expiringSet = createExpiringSet(1000);
    for (let i = 0; i < 100; i += 1) {
      expiringSet.add(`item-${i}`);
    }
    expect(expiringSet.size).toBe(100);
    expect(jest.getTimerCount()).toBe(100);
    expiringSet.destroy();
    expect(expiringSet.size).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });
});
