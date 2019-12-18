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

/**
 * Webpack Base Configuration
 */

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const validateNodeEnv = require('../utils/validateNodeEnv');

validateNodeEnv();

const nodeEnvIsProduction = process.env.NODE_ENV === 'production';

const prodPlugins = [
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false,
  }),
];

const plugins = [
  new webpack.EnvironmentPlugin([
    'NODE_ENV',
  ]),
  ...(nodeEnvIsProduction ? prodPlugins : []),
];

module.exports = {
  profile: true,
  devtool: nodeEnvIsProduction ? false : 'source-map',
  optimization: {
    minimize: nodeEnvIsProduction,
    minimizer: [
      new TerserPlugin({
        test: /\.jsx?$/i,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
          },
          keep_fnames: true,
        },
      }),
    ],
  },
  mode: nodeEnvIsProduction ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.(ttf|eot|svg|png|jpg)(\?.*)?$/,
        use: [{ loader: 'url-loader' }],
      },
      {
        test: /\.(woff)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          allowInlineConfig: false,
          ignore: false,
          useEslintrc: false,
          failOnError: true,
          plugins: ['@americanexpress/one-app'],
          parser: 'babel-eslint',
          parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module',
            ecmaFeatures: { modules: true },
          },
          rules: {
            'no-restricted-modules': ['error', 'create-react-class'],
            'no-restricted-imports': ['error', 'create-react-class'],
            '@americanexpress/one-app/no-app-config-on-client': 'error',
          },
        },
      },
    ],
  },
  externals: {
    '@americanexpress/one-app-router': {
      var: 'OneAppRouter',
      commonjs2: '@americanexpress/one-app-router',
    },
    holocron: {
      var: 'Holocron',
      commonjs2: 'holocron',
    },
    react: {
      var: 'React',
      commonjs2: 'react',
    },
    'react-dom': {
      var: 'ReactDOM',
      commonjs2: 'react-dom',
    },
    redux: {
      var: 'Redux',
      commonjs2: 'redux',
    },
    'react-redux': {
      var: 'ReactRedux',
      commonjs2: 'react-redux',
    },
    reselect: {
      var: 'Reselect',
      commonjs2: 'reselect',
    },
    immutable: {
      var: 'Immutable',
      commonjs2: 'immutable',
    },
    '@americanexpress/one-app-ducks': {
      var: 'OneAppDucks',
      commonjs2: '@americanexpress/one-app-ducks',
    },
    'holocron-module-route': {
      var: 'HolocronModuleRoute',
      commonjs2: 'holocron-module-route',
    },
    'prop-types': {
      var: 'PropTypes',
      commonjs2: 'prop-types',
    },
    'react-helmet': {
      var: 'ReactHelmet',
      commonjs2: 'react-helmet',
    },
  },
  plugins,
};
