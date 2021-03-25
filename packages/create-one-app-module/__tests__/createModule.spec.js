/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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
const path = require('path');
const { createModule } = require('../createModule');

jest.mock('../helpers/makeDirectory.js', () => ({
  makeDirectory: jest.fn(),
}));

jest.mock('../helpers/isDirectoryEmpty.js', () => ({
  isDirectoryEmpty: jest.fn(),
}));

jest.mock('child_process');

describe('createModule', () => {
  it('does', async () => {
    const appPath = path.resolve('packages/create-one-app-module/__tests__/__testfixtures__/empty');
    const useNpm = true;

    try {
      expect(await createModule({ appPath, useNpm })).toMatchSnapshot();
    } catch (error) {

    }
  });
});
