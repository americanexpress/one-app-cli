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

const { getProxy, getOnline } = require('../../helpers/isOnline');

jest.mock('child_process');
jest.mock('dns');

// jest.mock('dns', () => ({
//   lookup: (address, callback) => (address === 'registry.yarnpkg.com' ? callback(null, {}) : callback(new Error('Not Found'))),
// }));

const cacheEnv = {};

describe('isOnline', () => {
  beforeAll(() => {
    if (process.env.HTTPS_PROXY) {
      cacheEnv.HTTPS_PROXY = process.env.HTTPS_PROXY;
    }
  });
  beforeEach(() => {
    delete process.env.HTTPS_PROXY;
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.assign(process.env, cacheEnv);
  });

  describe('getProxy', () => {
    it('retrieves the npm proxy configuration from environment if available', () => {
      const expected = 'mock proxy setting env';
      process.env.HTTPS_PROXY = expected;
      const result = getProxy();
      expect(result).toEqual(expected);
    });
    it('retrieves the npm proxy configuration from npm config', () => {
      const expected = 'mock proxy setting npm config';
      execSync.mockReturnValueOnce(expected);
      const result = getProxy();
      expect(result).toEqual(expected);
    });
    it('returns undefined when npm command errors', () => {
      execSync.mockReturnValueOnce('null');
      const result = getProxy();
      expect(result).toEqual(undefined);
    });
  });

  describe('getOnline', () => {
    it('returns true when registry.yarnpkg.com can be reached and no proxy', async () => {
      dns.lookup.mockImplementationOnce((address, callback) => (address === 'registry.yarnpkg.com' ? callback(null, {}) : callback(new Error('Not Found'))));
      const isOnline = await getOnline();
      expect(isOnline).toBe(true);
    });

    it('returns false when registry.yarnpkg.com cannot be reached and no proxy', async () => {
      dns.lookup.mockImplementationOnce((address, callback) => (address === 'registry.yarnpkg.com' ? callback(new Error('Not Found')) : callback(null, {})));
      const isOnline = await getOnline();
      expect(isOnline).toBe(false);
    });

    it('returns false when registry.yarnpkg.com cannot be reached and improper proxy proxy', async () => {
      process.env.HTTPS_PROXY = 'not-a-proper-proxy';
      dns.lookup.mockImplementationOnce((address, callback) => (address === 'registry.yarnpkg.com' ? callback(new Error('Not Found')) : callback(null, {})));
      const isOnline = await getOnline();
      expect(isOnline).toBe(false);
    });

    it('uses the proxy', async () => {
      process.env.HTTPS_PROXY = 'https://example.com';
      dns.lookup = jest.fn()
        .mockImplementationOnce((address, callback) => (address === 'registry.yarnpkg.com' ? callback(new Error('Not Found')) : callback(null, {})))
        .mockImplementationOnce((address, callback) => (address === 'example.com' ? callback(null, {}) : callback(new Error('Not Found'))));

      const isOnline = await getOnline();
      expect(isOnline).toBe(true);
    });
  });
});
