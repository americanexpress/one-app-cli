/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

let fs = require('node:fs');

jest.mock('node:fs');

const setup = (modulePath) => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.doMock('node:util', () => ({
    parseArgs: jest.fn(() => ({ positionals: modulePath ? [modulePath] : [] })),
  }));

  fs = require('node:fs');
};

describe('serve-module', () => {
  process.cwd = () => '/mocked';
  const originalPlatform = process.platform;

  const setPlatform = (platform) => Object.defineProperty(process, 'platform', {
    value: platform,
  });

  beforeEach(() => {
    setup('../my-module-name');
  });

  afterAll(() => {
    setPlatform(originalPlatform);
  });

  it('should throw if no module path is provided', () => {
    setup();
    fs._.setFiles({});
    expect(() => require('../../bin/serve-module')).toThrowErrorMatchingInlineSnapshot('"serve-module(s) expects paths to modules to give to one-app to serve"');
  });

  it('should throw if the module doesn\'t have a version', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name' }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    expect(() => require('../../bin/serve-module')).toThrowErrorMatchingSnapshot();
  });

  it('should create a directory for the module', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    require('../../bin/serve-module');
    expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    expect(fs.mkdirSync.mock.calls[0][0]).toEqual('/mocked/static/modules');
    expect(fs.mkdirSync.mock.calls[1][0]).toEqual('/mocked/static/modules/my-module-name');
  });

  it('should remove a directory for the module if it already exists since only one version of a module can be served at a time', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
      '/mocked/static/modules/my-module-name/1.0.0': {},
    });
    require('../../bin/serve-module');
    expect(fs.rmSync).toHaveBeenCalledWith('/mocked/static/modules/my-module-name', { recursive: true, force: true });
  });

  it('should remove an existing symlink and create a new one', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '/mocked/static/modules/my-module-name/1.0.0': {},
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    setPlatform('darwin');
    require('../../bin/serve-module');
    expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
    expect(fs.unlinkSync).toHaveBeenCalledWith('/mocked/static/modules/my-module-name/1.0.0');
    expect(fs.symlinkSync).toHaveBeenCalledTimes(1);
    expect(fs.symlinkSync).toHaveBeenCalledWith('/my-module-name/build/1.0.0', '/mocked/static/modules/my-module-name/1.0.0', 'dir');
  });

  it('should work with an absolute module path', () => {
    setup('/absolute/path/to/module');
    fs._.setFiles({
      '/absolute/path/to/module/package.json': JSON.stringify({ name: 'absolute-module', version: '0.3.0' }),
      '/absolute/path/to/module/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    setPlatform('darwin');
    require('../../bin/serve-module');
    expect(fs.symlinkSync).toHaveBeenCalledWith('/absolute/path/to/module/build/0.3.0', '/mocked/static/modules/absolute-module/0.3.0', 'dir');
  });

  it('should use a junction on windows', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '/mocked/static/modules/my-module-name/1.0.0': {
        'my-module-name.client.js': function MyModule() {}.toString(),
        'my-module-name.server.js': function MyModule() {}.toString(),
      },
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    const { platform } = process;
    setPlatform('win32');
    require('../../bin/serve-module');
    expect(fs.symlinkSync).toHaveBeenCalledWith('/my-module-name/build/1.0.0', '/mocked/static/modules/my-module-name/1.0.0', 'junction');
    setPlatform(platform);
  });

  it('adds to the existing module map', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '/mocked/static/module-map.json': JSON.stringify({
        key: '--- omitted for development ---',
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
            legacyBrowser: {
              url: 'https://example.com/cdn/another-module/6.7.8/another-module.legacy.browser.js',
              integrity: '345',
            },
          },
        },
      }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    require('../../bin/serve-module');
    expect(fs._.getFiles()['/mocked/static/module-map.json']).toMatchSnapshot();
  });

  it('creates a module map when one does not exist', () => {
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '3.4.2' }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234', legacyBrowser: '974' }),
    });
    require('../../bin/serve-module');
    expect(fs._.getFiles()['/mocked/static/module-map.json']).toMatchSnapshot();
  });

  it('adds to the existing module map with a warning in place of the legacy browser SRI when legacy bundle does not exist', () => {
    process.env.NODE_ENV = 'development';
    fs._.setFiles({
      '../my-module-name/package.json': JSON.stringify({ name: 'my-module-name', version: '1.0.0' }),
      '/mocked/static/module-map.json': JSON.stringify({
        key: '--- omitted for development ---',
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
      }),
      '../my-module-name/bundle.integrity.manifest.json': JSON.stringify({ node: '123', browser: '234' }),
    });
    require('../../bin/serve-module');
    expect(fs._.getFiles()['/mocked/static/module-map.json']).toMatchSnapshot();
  });
});

/* eslint-enable global-require -- disables require enables */
