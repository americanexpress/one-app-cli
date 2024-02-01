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

import { emptyAggregatedStyles, getAggregatedStyles } from '@americanexpress/one-app-dev-bundler';
import fs from 'node:fs';
import ServerSsrStylesInjectorPlugin from '../../../webpack/plugins/server-ssr-styles-injector.js';
import {
  stylesPlaceholderUUID,
} from '../../../webpack/loaders/index-server-ssr-styles-placeholder-loader.js';

jest.mock('@americanexpress/one-app-dev-bundler', () => (
  {
    emptyAggregatedStyles: jest.fn(),
    getAggregatedStyles: jest.fn(() => JSON.stringify([{ css: '* {color: red}', digest: 'digest1Mock' }, { css: '* {color: green}', digest: 'digest2Mock' }])),
  }
));

const mockStylesPlaceholderUUID = stylesPlaceholderUUID;
jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(async () => `
    // replaced
    ssrStyles = '${mockStylesPlaceholderUUID}'
    
    =====
    
    // replaced
    ssrStyles = "${mockStylesPlaceholderUUID}"
    
    =====
    
    // not replaced
    ssrStyles = ${mockStylesPlaceholderUUID}
    `),
    writeFile: jest.fn(),
  },
}));

describe('ServerSsrStylesInjectorPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should Register an assetEmitted tap hook', () => {
    const plugin = new ServerSsrStylesInjectorPlugin();

    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn(),
        },
      },
    };

    plugin.apply(mockCompiler);

    expect(mockCompiler.hooks.assetEmitted.tap).toHaveBeenCalledTimes(1);
    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('ServerSsrStylesInjectorPlugin');
  });

  it('The registered function should inject the aggregated styles into the placeholder for .node.js files', async () => {
    expect.assertions(7);
    const plugin = new ServerSsrStylesInjectorPlugin();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    await registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.node.js' });

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);

    expect(fs.promises.writeFile.mock.calls[0][1]).toMatchSnapshot();

    expect(mockCompiler.hooks.assetEmitted.tap.mock.calls[0][0]).toBe('ServerSsrStylesInjectorPlugin');

    expect(getAggregatedStyles).toHaveBeenCalledTimes(1);
    expect(emptyAggregatedStyles).toHaveBeenCalledTimes(1);
  });
  it('The registered function should do nothing for non .node.js files', async () => {
    expect.assertions(5);
    const plugin = new ServerSsrStylesInjectorPlugin();

    let registeredFn;
    const mockCompiler = {
      hooks: {
        assetEmitted: {
          tap: jest.fn((_, fn) => {
            registeredFn = fn;
          }),
        },
      },
    };

    plugin.apply(mockCompiler);

    expect(registeredFn).not.toBe(undefined);

    await registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.note.js' });
    await registeredFn('fileNameMock.node.js', { targetPath: 'target/Path/Mock.browser.js' });
    await registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.legacyBrowser.js' });
    await registeredFn('fileNameMock', { targetPath: 'target/Path/Mock.something.js' });

    expect(fs.promises.readFile).toHaveBeenCalledTimes(0);
    expect(fs.promises.writeFile).toHaveBeenCalledTimes(0);

    expect(getAggregatedStyles).toHaveBeenCalledTimes(0);
    expect(emptyAggregatedStyles).toHaveBeenCalledTimes(0);
  });
});
