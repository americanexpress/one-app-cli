/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

import getCliOptions from '../../utils/get-cli-options.js';

jest.spyOn(process.argv, 'includes');
jest.spyOn(console, 'warn');

describe('get-cli-options', () => {
  let prevNodeEnv = null;
  let mockIncludesMap;

  beforeEach(() => {
    jest.clearAllMocks();

    prevNodeEnv = process.env.NODE_ENV;

    mockIncludesMap = {};
    process.argv.includes.mockImplementation((key) => mockIncludesMap[key]);
  });

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
  });

  it('should return the correct values in development mode for not watching and not live', () => {
    process.env.NODE_ENV = 'development';

    mockIncludesMap = {
      '--watch': false,
      '--live': false,
    };

    expect(getCliOptions()).toMatchInlineSnapshot(`
Object {
  "useLiveReload": false,
  "watch": false,
}
`);
  });

  it('should return the correct values in development mode for watching and not live', () => {
    process.env.NODE_ENV = 'development';

    mockIncludesMap = {
      '--watch': true,
      '--live': false,
    };

    expect(getCliOptions()).toMatchInlineSnapshot(`
Object {
  "useLiveReload": false,
  "watch": true,
}
`);
  });

  it('should return the correct values in development mode for watching and live', () => {
    process.env.NODE_ENV = 'development';

    mockIncludesMap = {
      '--watch': true,
      '--live': true,
    };

    expect(getCliOptions()).toMatchInlineSnapshot(`
Object {
  "useLiveReload": true,
  "watch": true,
}
`);
  });

  it('should warn, and return the correct values if not watching and live', () => {
    process.env.NODE_ENV = 'development';

    mockIncludesMap = {
      '--watch': false,
      '--live': true,
    };

    expect(getCliOptions()).toMatchInlineSnapshot(`
Object {
  "useLiveReload": true,
  "watch": true,
}
`);
  });

  it('should warn, and return the correct values if watching or live in production', () => {
    process.env.NODE_ENV = 'production';

    mockIncludesMap = {
      '--watch': false,
      '--live': true,
    };

    expect(getCliOptions()).toMatchInlineSnapshot(`
Object {
  "useLiveReload": false,
  "watch": false,
}
`);

    expect(console).toHaveWarnings([
      '--watch and --live are only supported for non-production builds. The have been ignored',
    ]);
  });
});
