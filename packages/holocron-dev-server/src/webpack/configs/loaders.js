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
  getWebpackVersion,
} from '../helpers';

export const fileLoader = () => {
  const webpackVersion = getWebpackVersion();
  if (webpackVersion >= 5) {
    return {
      // eslint-disable-next-line unicorn/no-unsafe-regex -- common regex for webpack loader
      test: /\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webm)(\?.*)?$/,
      type: 'asset/resource',
    };
  }
  // v4 and down
  return {
    // eslint-disable-next-line unicorn/no-unsafe-regex -- common regex for webpack loader
    test: /\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webm)(\?.*)?$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
        },
      },
    ],
  };
};

export const cssLoader = ({
  include,
  modules = true,
} = {}) => ({
  test: /\.(sa|sc|c)ss$/,
  exclude: /node_modules/,
  include,
  use: [
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        modules: modules && {
          localIdentName: '[name]__[local]___[contenthash:base64:5]',
        },
      },
    },
    {
      loader: 'sass-loader',
    },
  ],
});

export const jsxLoader = () => ({
  test: /\.jsx?$/i,
  use: [
    {
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true,
        babelrc: true,
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
        plugins: [require.resolve('react-refresh/babel')],
      },
    },
  ],
});
