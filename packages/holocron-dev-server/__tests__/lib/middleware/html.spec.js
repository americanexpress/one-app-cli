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

import createRenderingMiddleware from '../../../src/middleware/html';

import { renderDocument } from '../../../src/utils';

jest.mock('../../../src/utils');
jest.mock('../../../src/utils/logs');

beforeAll(() => {
  renderDocument.mockImplementation(() => '<html />');
});

describe('createRenderingMiddleware', () => {
  test('returns configured middleware handler function', () => {
    const config = {
      moduleMap: {},
      rootModuleName: 'root-module',
      errorReportingUrl: '/error',
    };
    const middleware = createRenderingMiddleware(config);
    expect(middleware).toBeInstanceOf(Function);
  });

  test('responds to request for static html and caches html renders', () => {
    const modules = [
      {
        name: 'root-module',
        src: 'root-module.js',
      },
    ];
    const config = {
      modules,
      rootModuleName: 'root-module',
      errorReportingUrl: '/error',
      moduleMap: {
        modules: {
          'root-module': {
            browser: 'root-module.js',
          },
        },
      },
    };

    const middleware = createRenderingMiddleware(config);
    const res = {
      status: jest.fn(() => res),
      type: jest.fn(() => res),
      send: jest.fn(() => res),
    };

    expect(middleware({}, res)).toEqual(undefined);
    expect(renderDocument).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.type).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledTimes(1);
    // caching the html prevents the document from being re-rendered
    expect(middleware({}, res)).toEqual(undefined);
    expect(renderDocument).toHaveBeenCalledTimes(1);
  });
});
