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

const checkForUpdate = require('update-check');
const { createModule } = require('../createModule');

const { validateNpmName } = require('../helpers/validatePackageName');

jest.mock('update-check', () => jest.fn());

jest.mock('../createModule', () => ({
  createModule: jest.fn(),
}));

jest.mock('../helpers/validatePackageName', () => ({
  validateNpmName: () => ({
    valid: true,
  }),
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
    process.argv = [
      '',
      '',
      'test-module',
    ];
    await require('..');
    console.log(createModule.mock);
  });
  it('name not passed', async () => {
    process.argv = [
      '',
      '',
      '',
    ];
    await require('..');
    console.log(createModule.mock);
  });
});
