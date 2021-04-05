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
const { createModule, DownloadError } = require('../createModule');
const isDirectoryEmpty = require('../helpers/isDirectoryEmpty');
const {
  getRepositoryInformation, hasRepository, hasExample, downloadAndExtractExample,
} = require('../helpers/getExamples');

jest.mock('child_process');
jest.mock('cross-spawn', () => jest.fn());

jest.mock('../helpers/makeDirectory', () => jest.fn());

jest.mock('../helpers/useYarn', () => jest.fn());

jest.mock('../helpers/install');

jest.mock('../helpers/isDirectoryEmpty', () => jest.fn());

jest.mock('../helpers/git', () => ({
  tryGitInit: () => true,
}));

jest.mock('../helpers/getExamples', () => ({
  getRepositoryInformation: jest.fn(),
  hasRepository: jest.fn(),
  hasExample: jest.fn(),
  downloadAndExtractRepository: jest.fn(),
  downloadAndExtractExample: jest.fn(),
}));

describe('createModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdirSync(path.join(__dirname, '../__tests__/__testfixtures__/createModule'));
  });
  afterEach(() => {
    rimraf.sync(path.join(__dirname, '../__tests__/__testfixtures__/createModule'));
    jest.clearAllMocks();
  });
  it('uses the default template', async () => {
    isDirectoryEmpty.mockImplementationOnce(() => true);
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/createModule');
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
  it('uses the default template with yarn', async () => {
    isDirectoryEmpty.mockImplementationOnce(() => true);
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/createModule');
    const useNpm = false;
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);

    const res = await createModule({ appPath, useNpm });
    expect(res).toMatchSnapshot();
  });
  it('handles an example url passed to it', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    getRepositoryInformation.mockImplementationOnce(() => ({
      username: 'americanexpress',
      name: 'one-app-cli',
      branch: 'main',
      filePath: 'with-fetchye',
    }));

    hasRepository.mockImplementationOnce(() => true);
    isDirectoryEmpty.mockImplementationOnce(() => true);
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/createModule');
    const useNpm = false;
    const example = 'https://github.com/americanexpress/one-app-cli/tree/main/examples/with-fetchye';
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);

    await createModule({ appPath, useNpm, example });
    expect(mockExit).toHaveBeenCalledTimes(0);
    mockExit.mockRestore();
  });
  it('handles an example passed to it', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    hasExample.mockImplementationOnce(() => true);
    isDirectoryEmpty.mockImplementationOnce(() => true);
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/createModule');
    const useNpm = false;
    const example = 'with-fetchye';
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);

    await createModule({ appPath, useNpm, example });
    expect(mockExit).toHaveBeenCalledTimes(0);
    mockExit.mockRestore();
  });
  it('exits if given an invalid GitHub URL', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/conflicted');
    const useNpm = true;
    const example = 'https://example.com';

    await createModule({ appPath, useNpm, example });
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });
  it('exits if repository could not be located', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    getRepositoryInformation.mockImplementationOnce(() => ({
      username: 'americanexpress',
      name: 'one-app-cli',
      branch: 'main',
      filePath: 'with-fetchye',
    }));
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/conflicted');
    const useNpm = true;
    const example = 'https://github.com/americanexpress/one-app-cli/tree/main/examples/with-fetchye';

    hasRepository.mockImplementationOnce(() => false);

    await createModule({ appPath, useNpm, example });
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });
  it('exits if given an example that cannot be found', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/conflicted');
    const useNpm = true;
    const example = 'with-fetchye';

    await createModule({ appPath, useNpm, example });
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });
  it('exits if new URL fails', async () => {
    const urlError = jest.spyOn(global, 'URL').mockImplementation(() => {
      throw new Error('Error');
    });

    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const appPath = path.join(__dirname, '../__tests__/__testfixtures__/conflicted');
    const useNpm = true;
    const example = 'with-fetchye';

    await createModule({ appPath, useNpm, example });
    expect(global.URL).toThrow();
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    urlError.mockRestore();
  });
});
