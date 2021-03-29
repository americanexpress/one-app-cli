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

import crossFetch from 'cross-fetch';
import {
  loadRemoteModuleMap,
  createLocalModuleMap,
  createUnifiedModuleMap,
  createModuleMap,
} from '../../../lib/utils';

jest.mock('cross-fetch');
const fetchMockFn = jest.spyOn(crossFetch, 'fetch');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

describe('loadRemoteModuleMap', () => {
  test('returns json response from loading module map', async () => {
    fetchMockFn.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({
        modules: {
          'child-module': {
            browser: {
              url: 'https://example.com/modules/child-module/child-module.js',
            },
          },
        },
      })
      ),
    });
    const remoteModuleMapUrl = 'https://example.com/modules/module-map.json';
    const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
    expect(remoteModuleMap).toEqual({
      modules: {
        'child-module': {
          browser: {
            url: 'https://example.com/modules/child-module/child-module.js',
          },
        },
      },
    });
  });
  test('remote module map is not string returns empty list of modules ', async () => {
    const remoteModuleMapUrl = {};
    const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
    expect(remoteModuleMap).toEqual({
      modules: {},
    });
  });
  test('error response if fetching remote module map returns status not ok', async () => {
    fetchMockFn.mockResolvedValueOnce({
      ok: false,
    });
    const remoteModuleMapUrl = 'https://example.com/modules/module-map.json';
    const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
    expect(remoteModuleMap).toEqual({
      modules: {},
    });
  });
  test('error response if fetching remote module map throws errors', async () => {
    fetchMockFn.mockRejectedValue(new Error('Async error'));
    const remoteModuleMapUrl = 'https://example.com/modules/module-map.json';
    const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
    expect(remoteModuleMap).toEqual({
      modules: {},
    });
  });
});

describe('createLocalModuleMap', () => {
  test('generates an empty local module map without modules', () => {
    const localModuleMap = createLocalModuleMap();
    expect(localModuleMap).toEqual({
      modules: {},
    });
  });

  test('generates a local module map from modules', () => {
    const modules = [
      {
        moduleName: 'root-module',
      },
    ];
    const localModuleMap = createLocalModuleMap(modules);
    expect(localModuleMap).toEqual({
      modules: {
        'root-module': {
          baseUrl: '/static/modules/root-module/',
          browser: {
            url: '/static/modules/root-module/root-module.js',
          },
        },
      },
    });
  });
});

describe('createUnifiedModuleMap', () => {
  test('combines the remote and local module map', () => {
    const modules = {};
    const localModuleMap = { modules };
    const remoteModuleMap = { modules };
    const moduleMap = createUnifiedModuleMap({
      localModuleMap,
      remoteModuleMap,
    });
    expect(moduleMap).toEqual({
      modules: {},
    });
  });
});

describe('createModuleMap', () => {
  test('loads remote module map and generate local module map to be combined', async () => {
    fetchMockFn.mockResolvedValueOnce({
      ok: true,
      json: jest.fn(() => Promise.resolve({
        modules: {
          'child-module': {
            browser: {
              url: 'https://example.com/modules/child-module/child-module.js',
            },
          },
          'child-module-2': {
            browser: {
              url: 'https://example.com/modules/child-module/child-module.js',
            },
          },
        },
      })
      ),
    });
    const modules = [
      {
        moduleName: 'root-module',
      },
      {
        moduleName: 'child-module-2',
      },
    ];
    const remoteModuleMapUrl = 'https://example.com/modules/module-map.json';
    const { remoteModuleMap, localModuleMap, moduleMap } = await createModuleMap({
      modules,
      remoteModuleMapUrl,
    });
    expect(remoteModuleMap).toEqual({
      modules: {
        'child-module': {
          browser: {
            url: 'https://example.com/modules/child-module/child-module.js',
          },
        },
        'child-module-2': {
          browser: {
            url: 'https://example.com/modules/child-module/child-module.js',
          },
        },
      },
    });
    expect(localModuleMap).toEqual({
      modules: {
        'child-module-2': {
          baseUrl: '/static/modules/child-module-2/',
          browser: {
            url: '/static/modules/child-module-2/child-module-2.js',
          },
        },
        'root-module': {
          baseUrl: '/static/modules/root-module/',
          browser: {
            url: '/static/modules/root-module/root-module.js',
          },
        },
      },
    });
    expect(moduleMap).toEqual({
      modules: {
        'root-module': {
          baseUrl: '/static/modules/root-module/',
          browser: {
            url: '/static/modules/root-module/root-module.js',
          },
        },
        'child-module-2': {
          baseUrl: '/static/modules/child-module-2/',
          browser: {
            url: '/static/modules/child-module-2/child-module-2.js',
          },
        },
        'child-module': {
          baseUrl: '/static/modules/child-module/',
          browser: {
            url: '/static/modules/child-module/child-module.browser.js',
          },
        },
      },
    });
  });
});
