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
const { readFile, writeFile, renderDynamicFileName } = require('../../src/utils/files');
const { ensureDirectoryPathExists } = require('../../src/utils/directory');

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'readFileSyncReturnMock'),
  writeFileSync: jest.fn(),
}));
jest.mock('../../src/utils/formatters', () => ({
  getFormatter: jest.fn(),
}));
jest.mock('../../src/utils/directory', () => ({
  ensureDirectoryPathExists: jest.fn(),
}));

describe('files Util functions', () => {
  describe('readFile', () => {
    it('should call fs.readFileSync with the correct parameters', () => {
      const content = readFile('file/path/mock');

      expect(content).toBe('readFileSyncReturnMock');

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenNthCalledWith(1, 'file/path/mock', 'utf8');
    });
  });
  describe('writeFile', () => {
    it('should ensure the requested directory exists, then write then call fs.writeFileSync', () => {
      writeFile('file/path/mock', 'fileContentMock');

      expect(ensureDirectoryPathExists).toHaveBeenCalledTimes(1);
      expect(ensureDirectoryPathExists).toHaveBeenNthCalledWith(1, 'file/path');

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, 'file/path/mock', 'fileContentMock');
    });
  });
  describe('renderDynamicFileName', () => {
    it('should look up the passed name in the dynamic file names dictionary, and return from there', () => {
      const templateOptionsMock = {
        dynamicFileNames: {
          'fileNameMock.js': 'dynamicFileNameMock.html',
        },
      };

      expect(renderDynamicFileName('fileNameMock.js', templateOptionsMock)).toBe('dynamicFileNameMock.html');
      expect(renderDynamicFileName('unknownFileNameMock.js', templateOptionsMock)).toBe('unknownFileNameMock.js');
    });
  });
});
