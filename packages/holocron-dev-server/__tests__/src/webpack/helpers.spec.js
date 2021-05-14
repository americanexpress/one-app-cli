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

import {
  createOneAppExternals,
  createHolocronModuleEntries,
} from '../../../src/webpack/helpers';

jest.mock('webpack', () => {
  const mockWebpack = jest.fn();
  mockWebpack.version = '';
  return mockWebpack;
});

describe('createOneAppExternals', () => {
  test('returns the set of externals used by One App', () => {
    const externals = createOneAppExternals();
    expect(externals).toMatchSnapshot();
  });

  test('returns the set of externals used by One App including added externals', () => {
    const externals = createOneAppExternals(['react-package']);
    expect(externals).toMatchSnapshot();
  });

  test('returns the set of externals from added externals in array formation [name, varName]', () => {
    const externals = createOneAppExternals([['react-package', 'reactPackage']]);
    expect(externals).toMatchSnapshot();
  });
});

describe('createHolocronModuleEntries', () => {
  test('returns an empty object if no modules were supplied', () => {
    const entries = createHolocronModuleEntries();
    expect(entries).toEqual({});
  });

  test('returns the entries (with hot entries) of modules to be bundled', () => {
    const moduleName = 'hot-module';
    const modulePath = '/some/path/to/hot-module';
    const modules = [{ moduleName, modulePath }];
    const entries = createHolocronModuleEntries({ modules, hot: true });
    expect(entries).toEqual({
      [moduleName]: [
        require.resolve('webpack-hot-middleware/client'),
        require.resolve('react-refresh/runtime'),
        `${modulePath}/src/index.js`,
      ],
    });
  });

  test('only returns the module entry when bundling without hot configured', () => {
    const moduleName = 'hot-module';
    const modulePath = '/some/path/to/hot-module';
    const modules = [{ moduleName, modulePath }];
    const entries = createHolocronModuleEntries({ modules });
    expect(entries).toEqual({
      [moduleName]: [`${modulePath}/src/index.js`],
    });
  });
});
