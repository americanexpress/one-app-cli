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
  fileLoader,
  cssLoader,
  jsxLoader,
  createJavaScriptSourceLoadersConfigFragment,
  createEsBuildConfigFragment,
} from '../../../../src/webpack/configs/loaders';
import { getWebpackVersion } from '../../../../src/webpack/helpers';

jest.mock('../../../../src/webpack/helpers', () => {
  const originalModule = jest.requireActual('../../../../src/webpack/helpers');

  return {
    ...originalModule,
    getWebpackVersion: jest.fn(() => 4),
  };
});

describe('fileLoader', () => {
  test('returns loader config for file types for webpack version 4 and below', () => {
    expect(fileLoader()).toMatchSnapshot();
  });
  test('returns loader config for file types for webpack version 5 and above', () => {
    getWebpackVersion.mockImplementationOnce(() => 5);

    expect(fileLoader()).toMatchSnapshot();
  });
});

describe('cssLoader', () => {
  test('returns loader config for CSS files', () => {
    expect(cssLoader()).toMatchSnapshot();
  });
  test('returns loader config for CSS files with postcss disabled', () => {
    expect(cssLoader({ postcss: false })).toMatchSnapshot();
  });
  test('returns loader config for CSS files with with inline disabled', () => {
    expect(cssLoader({ hot: false })).toMatchSnapshot();
  });
  test('returns loader config for CSS files with with inline and hot reloading disabled', () => {
    expect(cssLoader({ hot: false, inline: false })).toMatchSnapshot();
  });
});

describe('jsxLoader', () => {
  test('returns loader config for JavaScript files', () => {
    expect(jsxLoader().fragment.module.rules).toEqual([
      {
        exclude: undefined,
        include: undefined,
        test: /\.jsx?$/i,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              cacheDirectory: true,
              plugins: [],
              presets: [
                [
                  'amex',
                  {
                    modern: true,
                    'preset-env': {
                      modules: false,
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
    ]);
  });
  test('returns loader config for JavaScript files with hot reloading enabled', () => {
    expect(jsxLoader({ hot: true }).fragment.module.rules).toEqual([
      {
        exclude: undefined,
        include: undefined,
        test: /\.jsx?$/i,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              cacheDirectory: true,
              plugins: [require.resolve('react-refresh/babel')],
              presets: [
                [
                  'amex',
                  {
                    modern: true,
                    'preset-env': {
                      modules: false,
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
    ]);
  });
});

describe('createJavaScriptSourceLoadersConfigFragment', () => {
  test('returns config for javascript script loader', () => {
    expect(createJavaScriptSourceLoadersConfigFragment()).toEqual({
      module: {
        rules: [
          {
            test: /\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webm)(\?.*)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: 'assets/[name].[ext]',
                },
              },
            ],
          },
          {
            exclude: /node_modules/,
            include: undefined,
            test: /\.(sa|sc|c)ss$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  modules: {
                    localIdentName: '[name]__[local]___[contenthash:base64:5]',
                  },
                },
              },
              {
                loader: 'sass-loader',
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: {
                      cssnano: {},
                      'postcss-browser-reporter': {},
                      'postcss-preset-env': {
                        browsers: 'last 2 versions',
                      },
                    },
                    syntax: 'postcss-scss',
                  },
                  sourceMap: undefined,
                },
              },
            ],
          },
          {
            exclude: undefined,
            include: undefined,
            test: /\.jsx?$/i,
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: true,
                  cacheDirectory: true,
                  plugins: [],
                  presets: [
                    [
                      'amex',
                      {
                        modern: true,
                        'preset-env': {
                          modules: false,
                        },
                      },
                    ],
                  ],
                },
              },
            ],
          },
        ],
      },
    });
  });
});
describe('createEsBuildConfigFragment', () => {
  test('returns config for es build', () => {
    expect(createEsBuildConfigFragment()).toEqual({
      module: {
        rules: [
          {
            loader: require.resolve('esbuild-loader'),
            options: {
              loader: 'jsx',
              target: 'es2015',
            },
            test: /\.jsx?$/i,
          },
        ],
      },
    });
  });
});
