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

const runNpmInstall = require('../../src/utils/run-npm-install');
const runCommand = require('../../src/utils/run-command');

jest.mock('../../src/utils/run-command', () => jest.fn());

describe('runNpmInstall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call runCommand with the proper parameters', async () => {
    await runNpmInstall('workingDirectoryMock', ['additionArg1', 'additionArg2']);
    // resolve the promise by calling the registered on close function;

    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand).toHaveBeenNthCalledWith(
      1,
      'npm',
      [
        'install',
        '--no-audit',
        '--save',
        '--save-exact',
        '--loglevel',
        'error',
        'additionArg1',
        'additionArg2',
      ],
      'workingDirectoryMock'
    );
  });
});
