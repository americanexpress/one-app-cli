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
const fs = require('fs');
const spawn = require('cross-spawn');
const rimraf = require('rimraf');
const { createModule } = require('../createModule');
const { isDirectoryEmpty } = require('../helpers/isDirectoryEmpty');

jest.mock('../helpers/makeDirectory.js', () => ({
  makeDirectory: jest.fn(),
}));

jest.mock('../helpers/install.js');

jest.mock('../helpers/isDirectoryEmpty.js', () => ({
  isDirectoryEmpty: jest.fn(),
}));

jest.mock('child_process');

jest.mock('cross-spawn', () => jest.fn());

describe('createModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdirSync(path.join(__dirname, '../__tests__/__testfixtures__/createModule'));
  });
  afterEach(() => {
    rimraf.sync(path.join(__dirname, '../__tests__/__testfixtures__/createModule'));
  });
  it('uses the default template', async () => {
    isDirectoryEmpty.mockImplementationOnce(() => true);
    const appPath = path.resolve('packages/create-one-app-module/__tests__/__testfixtures__/createModule');
    const useNpm = true;
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);

    const res = await createModule({ appPath, useNpm });
    expect(res).toMatchSnapshot();
  });
  it('exits if directory is not empty', async () => {
    isDirectoryEmpty.mockImplementationOnce(() => false);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/conflicted');
    const useNpm = true;
    await createModule({ appPath, useNpm });
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });
});
