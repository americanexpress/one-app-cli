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

const spawn = require('cross-spawn');
const { install, installDevDependencies } = require('../../helpers/install');

jest.mock('cross-spawn', () => jest.fn());

describe('install', () => {
  it('installs dependencies without yarn', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = false;
    const isOnline = true;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(spawn).toHaveBeenCalled();
  });

  it('installs dependencies with yarn', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = true;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(spawn).toHaveBeenCalled();
  });

  it('installs dependencies with "--offline" flag if offline', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = false;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(spawn).toHaveBeenCalled();
  });

  // it('installs devDependencies', () => {

  // });
});
