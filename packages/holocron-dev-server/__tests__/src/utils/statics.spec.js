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

import { execSync, spawnSync } from 'child_process';
import {
  addStaticsDirToGitIgnore,
  loadOneAppStaticsFromDocker,
  loadStatics,
} from '../../../src/utils/statics';

import { ufs } from '../../../src/utils/virtual-file-system';

jest.mock('../../../src/utils/virtual-file-system');
jest.mock('child_process', () => ({
  execSync: jest.fn(() => 'en-US'),
  spawnSync: jest.fn(() => ''),
}));

beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation();
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

beforeEach(() => {
  jest.clearAllMocks();
});

const readFileSyncToString = jest.fn(() => 'node_modules');

beforeAll(() => {
  ufs.existsSync = jest.fn(() => true);
  ufs.readdirSync = jest.fn(() => ['latest']);
  ufs.readFileSync = jest.fn(() => 'script with removed eval');
  ufs.writeFileSync = jest.fn(() => 'sample-module/static/app/app.js');
});

describe('addStaticsDirToGitIgnore', () => {
  it('adds static directory to .gitignore', () => {
    ufs.readFileSync.mockImplementationOnce(() => ({ toString: readFileSyncToString }));
    expect(() => addStaticsDirToGitIgnore()).not.toThrow();
  });

  it('ignores adding static directory to .gitignore', () => {
    ufs.readFileSync.mockImplementationOnce(() => ({
      toString: jest.fn(() => ({
        includes: jest.fn(() => true),
      })),
    }));
    expect(() => addStaticsDirToGitIgnore()).not.toThrow();
  });

  it('ignores adding static directory to .gitignore if gitignore is not present', () => {
    ufs.existsSync.mockImplementationOnce(() => false);
    expect(() => addStaticsDirToGitIgnore()).not.toThrow();
  });
});

describe('loadOneAppStaticsFromDocker', () => {
  it('adds One App statics from docker image', () => {
    ufs.readFileSync.mockImplementationOnce(() => ({ toString: () => 'node_modules' }));
    expect(() => loadOneAppStaticsFromDocker()).not.toThrow();
  });

  it('catches any errors when loading in One App statics', () => {
    execSync.mockImplementationOnce(() => {
      throw new Error('error');
    });
    expect(() => loadOneAppStaticsFromDocker()).not.toThrow();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

describe('loadStatics', () => {
  const config = {
    dockerImage: 'oneamex/one-app-dev:latest',
  };

  it('does nothing when One App statics already exists', async () => {
    expect(loadStatics()).toBeUndefined();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledTimes(1);
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("sets up One App statics and loads them from docker image when it doesn't exist", async () => {
    ufs.existsSync.mockImplementationOnce(() => false).mockImplementationOnce(() => false);
    expect(loadStatics(config)).toBeUndefined();
    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledTimes(3);
    expect(spawnSync).toHaveBeenCalledTimes(2);
  });
});
