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

const fs = require('fs');
const { ensureDirectoryPathExists, isDirectory } = require('../../src/utils/directory');

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(() => true),
  lstatSync: jest.fn(() => ({
    isDirectory: jest.fn(() => 'isDirectoryMock'),
  })),
}));

describe('directory utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('ensureDirectoryPathExists', () => {
    it('should not call mkdirSync if existsSync returns trur', () => {
      ensureDirectoryPathExists('pathMock');
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenNthCalledWith(1, 'pathMock');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
    });
    it('should call mkdirSync if existsSync returns false', () => {
      fs.existsSync.mockImplementation(() => false);
      ensureDirectoryPathExists('pathMock');
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenNthCalledWith(1, 'pathMock');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, 'pathMock', { recursive: true, mode: 0o777 });
    });
  });
  describe('isDirectory', () => {
    it('should return the same value as returned from `isDirectory` called on the response from lstatSync', () => {
      expect(isDirectory('pathMock')).toBe('isDirectoryMock');
      expect(fs.lstatSync).toHaveBeenCalledTimes(1);
      expect(fs.lstatSync).toHaveBeenNthCalledWith(1, 'pathMock');
    });
  });
});
