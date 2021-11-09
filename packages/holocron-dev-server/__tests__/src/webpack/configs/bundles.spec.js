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

import { validate } from 'webpack';

import {
  createHolocronModuleWebpackConfig,
} from '../../../../src/webpack/configs/bundles';
import { getWebpackVersion, modulesLibraryVarName } from '../../../../src/webpack/helpers';

jest.mock('../../../../src/webpack/helpers', () => {
  const originalModule = jest.requireActual('../../../../src/webpack/helpers');

  return {
    ...originalModule,
    getWebpackVersion: jest.fn(() => 5),
  };
});
const { NODE_ENV } = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = NODE_ENV;
});

jest.mock('/path/webpack.config.js', () => ({
  entry: './app/app.js',
  output: {
    filename: 'app.min.js',
    path: './public/static/',
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css?modules&localIdentName=[name]---[local]---[hash:base64:5]'],
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
}), { virtual: true });

describe('createHolocronModuleWebpackConfig', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => '/path');

  test('creates the webpack config for Holocron re-loadable modules', () => {
    const modules = [
      {
        moduleName: 'hot-module',
        modulePath: 'path/to/hot-module',
      },
    ];
    const config = createHolocronModuleWebpackConfig({
      modules,
    });
    expect(validate(config).length).toBe(2);
  });
  test('creates the webpack config for Holocron re-loadable modules - webpack v4', () => {
    getWebpackVersion.mockImplementationOnce(() => 4);
    const modules = [
      {
        moduleName: 'hot-module',
        modulePath: 'path/to/hot-module',
      },
    ];
    const config = createHolocronModuleWebpackConfig({
      modules,
    });
    expect(config.output.library).toBe(modulesLibraryVarName);
  });

  test('load custom webpack config', () => {
    const config = createHolocronModuleWebpackConfig({
      webpackConfigPath: 'webpack.config.js',
    });
    expect(validate(config).length).toBe(3);
  });
});
