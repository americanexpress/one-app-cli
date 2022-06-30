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

/* eslint-disable global-require --
testing `on import` functionality needs 'require' in every tests */

jest.mock('read-pkg-up', () => ({ sync: jest.fn(() => ({ pkg: {} })) }));

describe('getCliOptions', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    process.argv = originalArgv;
  });

  it('should set watch to true when the flag is included', () => {
    process.argv = ['bundle-module', ' ', '--watch'];
    const getCliOptions = require('../../utils/getCliOptions');
    expect(getCliOptions()).toMatchObject({ watch: true });
  });

  it('should set watch to false when the flag is not included', () => {
    process.argv = ['bundle-module'];
    const getCliOptions = require('../../utils/getCliOptions');
    expect(getCliOptions()).toMatchObject({ watch: false });
  });
});

/* eslint-enable global-require -- disables require enables */
