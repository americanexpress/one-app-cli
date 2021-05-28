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

import fetch from 'cross-fetch';

import createModulesProxyRelayMiddleware from '../../../src/middleware/proxy-relay';
import { volume } from '../../../src/utils/virtual-file-system';
import { logError } from '../../../src/utils/logs';

jest.mock('cross-fetch');
jest.mock('../../../src/utils/logs');

beforeAll(() => {
  fetch.mockImplementation(() => Promise.resolve({
    ok: true,
    text: jest.fn(() => Promise.resolve('Holocron.registerModule("my-module");')),
  }));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createModulesProxyRelayMiddleware', () => {
  const localModuleMap = {
    modules: {
      'root-module': {
        baseUrl: '/static/modules/root-module/',
        browser: {
          url: '/static/modules/root-module/root-module.js',
        },
      },
    },
  };
  const remoteModuleMap = {
    modules: {
      'child-module': {
        browser: {
          url: 'https://example.com/modules/child-module/v1.2.3-0/child-module.browser.js',
        },
      },
    },
  };
  const moduleMap = {
    modules: {
      'root-module': {
        baseUrl: '/static/modules/root-module/',
        browser: {
          url: '/static/modules/root-module/root-module.js',
        },
      },
      'child-module': {
        baseUrl: '/static/modules/child-module/',
        browser: {
          url: '/static/modules/child-module/child-module.browser.js',
        },
      },
    },
  };

  test('returns memoized middleware handle', () => {
    expect(
      createModulesProxyRelayMiddleware({
        localModuleMap,
        remoteModuleMap,
        moduleMap,
      })
    ).toBeInstanceOf(Function);
  });

  test('middleware does not respond to local module requests', async () => {
    const middleware = createModulesProxyRelayMiddleware({
      localModuleMap,
      remoteModuleMap,
      moduleMap,
    });
    const req = {
      path: '/static/modules/root-module/root-module.js',
    };
    const next = jest.fn();
    await middleware(req, null, next);
    expect(fetch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('middleware fetches remote resource and stores in virtual volume', async () => {
    const middleware = createModulesProxyRelayMiddleware({
      localModuleMap,
      remoteModuleMap,
      moduleMap,
    });
    const req = {
      path: '/static/modules/child-module/child-module.browser.js',
    };
    const next = jest.fn();
    await middleware(req, null, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(volume.toJSON()).toEqual({
      [`${process.cwd()}/static/modules/child-module/child-module.browser.js`]: 'Holocron.registerModule("my-module");',
    });
  });

  test('middleware fetches remote language pack and stores in virtual volume', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ text: () => 'lang pack' }));
    const middleware = createModulesProxyRelayMiddleware({
      localModuleMap,
      remoteModuleMap,
      moduleMap,
    });
    const req = {
      path: '/static/modules/child-module/en-us/child-module.json',
    };
    const next = jest.fn();
    await middleware(req, null, next);
    expect(fetch).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(volume.toJSON()).toEqual({
      [`${process.cwd()}/static/modules/child-module/child-module.browser.js`]: 'Holocron.registerModule("my-module");',
      [`${process.cwd()}/static/modules/child-module/en-us/child-module.json`]: 'lang pack',
    });
  });

  test('middleware does not fetch when remote resource that already exists in virtual volume', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const middleware = createModulesProxyRelayMiddleware({
      localModuleMap,
      remoteModuleMap,
      moduleMap,
    });
    const req = {
      path: '/static/modules/child-module/en-us/child-module.json',
    };
    const next = jest.fn();
    await middleware(req, null, next);
    expect(fetch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('middleware fails when fetching remote language pack and stores default value in virtual volume', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    fetch.mockImplementationOnce(() => Promise.reject('error'));
    const middleware = createModulesProxyRelayMiddleware({
      localModuleMap,
      remoteModuleMap,
      moduleMap,
    });
    const req = {
      path: '/static/modules/child-module/en-ca/child-module.json',
    };
    const next = jest.fn();
    await middleware(req, null, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(volume.toJSON()).toEqual({
      [`${process.cwd()}/static/modules/child-module/child-module.browser.js`]: 'Holocron.registerModule("my-module");',
      [`${process.cwd()}/static/modules/child-module/en-us/child-module.json`]: 'lang pack',
      [`${process.cwd()}/static/modules/child-module/en-ca/child-module.json`]: '',
    });
    expect(logError).toHaveBeenCalledWith('error');
  });
});
