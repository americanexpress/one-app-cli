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

const { execSync } = require('child_process');
const dns = require('dns');
const url = require('url');

const getOnline = require('../../helpers/isOnline');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('dns', () => ({
  lookup: jest.fn(),
}));

describe('getOnline', () => {
  it('should return if online or not', () => {
    getOnline();

    expect(dns.lookup).toHaveBeenCalled();
  });
});
