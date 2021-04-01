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

import { libraryName } from '../../../../src/constants';
import {
  log,
  warn,
  error,
  info,
  getLogLevel,
  setLogLevel,
  setDebugMode,
} from '../../../../src/utils/logs';

describe('log', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    ['info', 'log', 'warn', 'error'].forEach((key) => {
      jest.spyOn(console, key).mockImplementation();
    });
  });

  test('log calls console.log', () => {
    expect(() => log()).not.toThrow();
    expect(console.log).toHaveBeenCalled();
  });

  test('warn calls console.warn', () => {
    expect(() => warn()).not.toThrow();
    expect(console.warn).toHaveBeenCalled();
  });

  test('error calls console.error', () => {
    expect(() => error()).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  test('info calls console.info', () => {
    expect(() => info()).not.toThrow();
    expect(console.info).toHaveBeenCalled();
  });

  test('sets and gets log level', () => {
    // default level is 4
    expect(getLogLevel()).toEqual(4);
    // setting null does nothing
    expect(setLogLevel(null)).toEqual(undefined);
    expect(getLogLevel()).toEqual(4);
    // setting with number directly assigns
    expect(setLogLevel(1)).toEqual(undefined);
    expect(getLogLevel()).toEqual(1);
    expect(setLogLevel()).toEqual(undefined);
    expect(getLogLevel()).toEqual(4);
    // setting log level by name
    expect(setLogLevel('log')).toEqual(undefined);
    expect(getLogLevel()).toEqual(3);
  });

  test('sets debug mode', () => {
    setDebugMode();
    expect(process.env.DEBUG).toEqual(libraryName);
  });
});
