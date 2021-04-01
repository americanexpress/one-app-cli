/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

import { clearPublisher, setPublisher, publish } from '../../../src/utils/publish';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('client-publishing', () => {
  const publisher = jest.fn();

  test('sets and calls the publisher', () => {
    const args = ['a', 'b', 'c'];
    expect(setPublisher(publisher)).toBe(undefined);
    expect(publisher).not.toHaveBeenCalled();
    expect(publish(...args)).toBe(undefined);
    expect(publisher).toHaveBeenCalledWith(...args);
  });

  test('sets and unsets the publisher', () => {
    expect(setPublisher(publisher)).toBe(undefined);
    expect(publisher).not.toHaveBeenCalled();
    expect(publish()).toBe(undefined);
    expect(publisher).toHaveBeenCalledTimes(1);
    expect(setPublisher()).toBe(undefined);
    expect(publish()).toBe(undefined);
    expect(publisher).toHaveBeenCalledTimes(1);
  });

  test('clears the publisher', () => {
    expect(clearPublisher()).toBe(undefined);
    expect(publish()).toBe(undefined);
    expect(publisher).not.toHaveBeenCalled();
  });
});
