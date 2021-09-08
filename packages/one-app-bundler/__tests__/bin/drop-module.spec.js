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

/* eslint-disable global-require */
// eslint erroneously thinks mock-fs should not be a devDependency
// eslint-disable-next-line import/no-extraneous-dependencies
let fs = require('fs');

jest.mock('fs');
jest.mock('yargs', () => ({
  argv: { _: ['my-module-name'] },
}));

describe('drop-module', () => {
  process.cwd = () => '/mocked';

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    fs = require('fs');
  });

  it('should throw an error if it cannot access the module map', () => {
    fs._.setFiles({});
    expect(() => require('../../bin/drop-module')).toThrowErrorMatchingSnapshot();
  });

  it('should remove the module from the module map', () => {
    fs._.setFiles({
      '/mocked/static/module-map.json': JSON.stringify({
        modules: {
          'my-module-name': {
            node: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.browser.js',
              integrity: '234',
            },
          },
          'another-module': {
            node: {
              url: 'https://example.com/cdn/another-module/6.7.8/another-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/another-module/6.7.8/another-module.browser.js',
              integrity: '234',
            },
          },
        },
      }),
      '/mocked/static/modules/my-module-name': {},
    });
    require('../../bin/drop-module');

    expect(fs._.getFiles()).toMatchSnapshot();
    expect(fs.writeFileSync).toHaveBeenCalledWith('/mocked/static/module-map.json', JSON.stringify({
      modules: {
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/6.7.8/another-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/6.7.8/another-module.browser.js',
            integrity: '234',
          },
        },
      },
    }));
  });

  it('should remove the module directory', () => {
    fs._.setFiles({
      '/mocked/static/module-map.json': JSON.stringify({
        modules: {
          'my-module-name': {
            node: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.browser.js',
              integrity: '234',
            },
          },
        },
      }),
      '/mocked/static/modules/my-module-name': {},
    });
    expect(fs._.getFiles()).toHaveProperty('/mocked/static/modules/my-module-name');
    require('../../bin/drop-module');

    expect(fs.rmdirSync).toHaveBeenCalledWith('/mocked/static/modules/my-module-name');
    expect(fs._.getFiles()).not.toHaveProperty('/mocked/static/modules/my-module-name');
  });

  it('should not error if the module directory does not exist', () => {
    fs._.setFiles({
      '/mocked/static/module-map.json': JSON.stringify({
        modules: {
          'my-module-name': {
            node: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/my-module-name/6.7.8/my-module-name.browser.js',
              integrity: '234',
            },
          },
        },
      }),
      '/mocked/static/modules/my-module-name': {},
    });
    expect(() => require('../../bin/drop-module')).not.toThrowError();
  });
});
