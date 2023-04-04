/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const chokidar = require('chokidar');
const index = require('..');
const compileModuleLocales = require('../src/compileModuleLocales');

jest.useFakeTimers();

jest.mock('chokidar', () => {
  const mockChokidar = {
    watch: jest.fn(() => mockChokidar),
    on: jest.fn(() => mockChokidar),
  };

  return mockChokidar;
});
jest.mock('../src/compileModuleLocales', () => jest.fn(() => Promise.resolve()));

describe('index', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => 'module/path');
  const consoleLogSpy = jest.spyOn(console, 'log');

  beforeEach(() => jest.clearAllMocks());

  it('exports an function', () => {
    expect(typeof index).toEqual('function');
  });

  it('returns undefined', () => {
    expect(index()).toEqual(undefined);
  });

  it('compiles the module locales', () => {
    index();
    expect(compileModuleLocales).toHaveBeenCalledTimes(1);
    expect(chokidar.watch).not.toHaveBeenCalled();
    expect(chokidar.on).not.toHaveBeenCalled();
  });

  it('watches the locale directory for changes', () => {
    index(true);
    expect(compileModuleLocales).toHaveBeenCalledTimes(1);
    expect(chokidar.watch).toHaveBeenCalledTimes(1);
    expect(chokidar.watch.mock.calls).toMatchSnapshot();
    expect(chokidar.on).toHaveBeenCalledTimes(1);
    expect(chokidar.on.mock.calls[0][0]).toBe('all');
    chokidar.on.mock.calls[0][1]();
    expect(compileModuleLocales).toHaveBeenCalledTimes(2);
  });

  it('throws on initial error', async () => {
    compileModuleLocales.mockRejectedValueOnce(new SyntaxError('some error'));
    await expect(async () => {
      await index();
      jest.runAllTimers();
    }).rejects.toThrowError(new SyntaxError('some error'));
  });

  it('logs to console on error during watch', async () => {
    index(true);
    compileModuleLocales.mockRejectedValueOnce(new SyntaxError('some error'));
    await chokidar.on.mock.calls[0][1]();
    jest.runAllTimers();
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Error generating language packs: SyntaxError: some error');
  });
});
