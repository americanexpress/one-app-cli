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

const { createModule } = require('../createModule');

jest.mock('update-check', () => jest.fn());

jest.mock('../createModule', () => ({
  createModule: jest.fn(),
}));

describe('create one app module', () => {
  const originalProcessExit = process.exit;
  const originalProcessArgv = process.argv;

  beforeAll(() => {
    process.exit = jest.fn();
  });

  beforeEach(() => {
    jest
      .resetModules()
      .clearAllMocks();

    process.argv = originalProcessArgv;
  });

  afterAll(() => {
    process.argv = originalProcessArgv;
    process.exit = originalProcessExit;
  });

  it('name passed to command', async () => {
    jest.mock('../helpers/validatePackageName', () => jest.fn(() => ({ valid: true })));
    jest.mock('prompts', () => jest.fn(() => Promise.resolve({
      path: 'prompts-test',
    })));
    process.argv = [
      '',
      '',
      'test-module',
    ];
    await require('..');
    expect(createModule).toHaveBeenCalled();
  });
  it('name not passed', async () => {
    process.argv = [
      '',
      '',
      '',
    ];
    await require('..');
    expect(createModule).toHaveBeenCalled();
  });
  it('exits if nothing given', async () => {
    jest.mock('prompts', () => jest.fn(() => Promise.resolve({
      path: '',
    })));
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    process.argv = [
      '',
      '',
      '',
    ];
    await require('..');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });
  it('exits if example flag given without a value', async () => {
    jest.mock('../helpers/validatePackageName', () => jest.fn(() => ({ valid: true })));
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    process.argv = [
      '',
      '',
      'test-module',
      '--example',
    ];
    await require('..');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
  });

  it('pass an invalid name', async () => {
    jest.mock('../helpers/validatePackageName', () => jest.fn(() => ({
      valid: false,
      problems: [
        'invalid name',
      ],
    })));
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    process.argv = [
      '',
      '',
      'invalid-example',
    ];
    await require('..');
    expect(mockExit).toHaveBeenCalledTimes(1);
    mockExit.mockRestore();
  });
});
