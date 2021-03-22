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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('installs dependencies with npm', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = false;
    const isOnline = true;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(mockSpawn.calls[0].command).toEqual('npm');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
  });

  it('installs dependencies with yarn', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = true;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(mockSpawn.calls[0].command).toEqual('yarnpkg');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
  });

  it('installs dependencies with yarn while offline', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = false;
    await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    expect(mockSpawn.calls[0].command).toEqual('yarnpkg');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
    expect(mockSpawn.calls[0].args).toContain('--offline');
  });

  it('installing dependencies fails with error message if exit code is not 0', async () => {
    expect.assertions(2);
    const mockSpawn = require('mock-spawn')();
    mockSpawn.sequence.add(mockSpawn.simple(1));
    spawn.mockImplementationOnce(mockSpawn);

    const useYarn = false;
    const isOnline = true;
    try {
      await install('test-module', ['react', 'react-dom'], { useYarn, isOnline });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }

    expect(mockSpawn.calls[0].command).toEqual('npm');
  });

  it('installs devDependencies with yarn', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = true;
    await installDevDependencies('test-module', ['@americanexpress/one-app-bundler',
      '@americanexpress/one-app-runner',
      'amex-jest-preset-react',
      'babel-eslint',
      'babel-preset-amex',
      'enzyme',
      'enzyme-to-json',
      'eslint',
      'eslint-config-amex',
      'jest',
      'rimraf'], { useYarn, isOnline });

    expect(mockSpawn.calls[0].command).toEqual('yarnpkg');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
  });

  it('installs devDependencies with yarn while offline', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);
    const useYarn = true;
    const isOnline = false;
    await installDevDependencies('test-module', ['@americanexpress/one-app-bundler',
      '@americanexpress/one-app-runner',
      'amex-jest-preset-react',
      'babel-eslint',
      'babel-preset-amex',
      'enzyme',
      'enzyme-to-json',
      'eslint',
      'eslint-config-amex',
      'jest',
      'rimraf'], { useYarn, isOnline });
    expect(mockSpawn.calls[0].command).toEqual('yarnpkg');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
    expect(mockSpawn.calls[0].args).toContain('--offline');
  });
  it('installs devDependencies using npm', async () => {
    const mockSpawn = require('mock-spawn')();
    spawn.mockImplementationOnce(mockSpawn);

    const useYarn = false;
    const isOnline = true;
    await installDevDependencies('test-module',
      [
        '@americanexpress/one-app-bundler',
        '@americanexpress/one-app-runner',
        'amex-jest-preset-react',
        'babel-eslint',
        'babel-preset-amex',
        'enzyme',
        'enzyme-to-json',
        'eslint',
        'eslint-config-amex',
        'jest',
        'rimraf',
      ], { useYarn, isOnline });

    expect(mockSpawn.calls[0].command).toEqual('npm');
    expect(mockSpawn.calls[0].args).toMatchSnapshot();
  });

  it('installing devDependencies fails with error message if exit code is not 0', async () => {
    expect.assertions(2);
    const mockSpawn = require('mock-spawn')();
    mockSpawn.sequence.add(mockSpawn.simple(1));
    spawn.mockImplementationOnce(mockSpawn);

    const useYarn = false;
    const isOnline = true;
    try {
      await installDevDependencies('test-module',
        [
          '@americanexpress/one-app-bundler',
          '@americanexpress/one-app-runner',
          'amex-jest-preset-react',
          'babel-eslint',
          'babel-preset-amex',
          'enzyme',
          'enzyme-to-json',
          'eslint',
          'eslint-config-amex',
          'jest',
          'rimraf',
        ], { useYarn, isOnline });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }

    expect(mockSpawn.calls[0].command).toEqual('npm');
  });
});
