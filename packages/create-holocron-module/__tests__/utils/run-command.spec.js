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

const spawn = require('cross-spawn');
const runCommand = require('../../src/utils/run-command');

jest.mock('cross-spawn', () => jest.fn(() => ({
  on: jest.fn(),
})));

describe('runCommand', () => {
  let subProcessMock;
  beforeEach(() => {
    jest.clearAllMocks();
    subProcessMock = {
      on: jest.fn(),
    };
    spawn.mockImplementation(() => subProcessMock);
  });
  it('should spawn a subProcess with the proper parameters', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenNthCalledWith(
      1,
      'commandMock',
      [
        'arg1',
        'arg2',
      ],
      {
        cwd: 'workingDirectoryMock',
        stdio: 'inherit',
      });
  });
  it('should spawn a subProcess with the proper parameters with defaults', async () => {
    const promise = runCommand('commandMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenNthCalledWith(
      1,
      'commandMock',
      [],
      {
        cwd: './',
        stdio: 'inherit',
      });
  });
  it('should register an on close handler to the sub process', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(subProcessMock.on).toHaveBeenCalledTimes(1);
    // expecting a function to have been called with something,
    // and looking that thing up in that functions mocked parameters is not really testing anything
    // in this test we are testing that the first parameter is correct,
    // the passed function is tested in another test
    expect(subProcessMock.on).toHaveBeenNthCalledWith(1, 'close', subProcessMock.on.mock.calls[0][1]);
  });
  describe('the registered on close handler', () => {
    let promise;
    let isResolved;
    let isRejected;
    beforeEach(() => {
      promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
      isResolved = false;
      isRejected = false;
      promise
        .then(() => { isResolved = true; })
        .catch(() => {});
    });
    it('should do nothing and resolve the promise if passed 0', async () => {
      subProcessMock.on.mock.calls[0][1](0);
      await promise;
      expect(isResolved).toBe(true);
      expect(isRejected).toBe(false);
    });
    it('should reject the promise if passed not 0', async () => {
      try {
        subProcessMock.on.mock.calls[0][1](1);
        await promise;
      } catch (err) {
        isRejected = true;
        expect(err.message).toBe('Failed to execute: commandMock arg1 arg2');
      } finally {
        expect(isResolved).toBe(false);
        expect(isRejected).toBe(true);
      }
    });
  });
});
