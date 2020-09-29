/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import path from 'path';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';

export const fileLoader = {
  test: /\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webm)(\?.*)?$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: '../assets/[name].[ext]',
    },
  }],
};

export const cssLoader = {
  test: /\.(sa|sc|c)ss$/,
  exclude: /node_modules/,
  use: [
    {
      loader: ExtractCssChunks.loader,
      options: {
        hmr: true,
        esModule: true,
        modules: {
          namedExport: true,
        },
      },
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        modules: {
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    {
      loader: 'sass-loader',
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        postcssOptions: {
          syntax: 'postcss-scss',
          plugins: {
            'postcss-preset-env': {
              browsers: 'last 2 versions',
            },
            cssnano: {},
            'postcss-browser-reporter': {},
          },
        },
      },
    },
  ],
};

export const jsxLoader = ({ plugins = [], presets = [] } = {}) => ({
  test: /\.jsx?$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cwd: path.resolve(__dirname, '..'),
        cacheDirectory: true,
        babelrc: false,
        // TODO: make extensible for special cases
        presets: [
          [
            'amex',
            {
              'preset-env': {
                modules: false,
              },
            },
          ],
          ...presets,
        ],
        plugins,
      },
    },
  ],
});
