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
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import fs from 'node:fs';
import { writeToModuleConfig } from '../../utils/writeToModuleConfig';

jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => JSON.stringify({})),
  existsSync: jest.fn(),
}));

jest.mock('read-package-up', () => ({
  readPackageUpSync: () => ({
    packageJson: {
      name: 'my-module-name',
      version: '1.2.3',
    },
  }),
}));

describe('write-to-module-config', () => {
  beforeAll(() => {
    process.cwd = () => '/mock-path';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module-config.json does not exist', () => {
    beforeEach(() => {
      fs.existsSync.mockImplementation(() => false);
    });

    it('successfully writes to module config', () => {
      writeToModuleConfig({ my: 'module-config' });
      expect(fs.writeFileSync).toHaveBeenCalledWith('/mock-path/build/1.2.3/module-config.json', '{\n  "my": "module-config"\n}');
    });
  });

  describe('module-config.json exists', () => {
    beforeEach(() => {
      fs.existsSync.mockImplementation(() => true);
      fs.readFileSync.mockImplementation(() => JSON.stringify({
        hello: 'im here',
      }));
    });

    it('successfully writes to module config', () => {
      writeToModuleConfig({ my: 'module-config' });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock-path/build/1.2.3/module-config.json',
        '{\n  "hello": "im here",\n  "my": "module-config"\n}'
      );
    });
  });
});
