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

/**
 * Webpack Base Configuration
 */

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const validateNodeEnvironment = require('../utils/validateNodeEnv');

validateNodeEnvironment();

const nodeEnvironmentIsProduction = process.env.NODE_ENV === 'production';

const productionPlugins = [
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false,
  }),
];

const plugins = [
  new webpack.EnvironmentPlugin([
    'NODE_ENV',
  ]),
  ...nodeEnvironmentIsProduction ? productionPlugins : [],
];

module.exports = {
  profile: true,
  devtool: nodeEnvironmentIsProduction ? false : 'source-map',
  optimization: {
    minimize: nodeEnvironmentIsProduction,
    minimizer: [
      new TerserPlugin({
        test: /\.[jt]sx?$/i,
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
  mode: process.env.NODE_ENV,
  externals: {
    '@americanexpress/one-app-router': {
      var: 'OneAppRouter',
      commonjs2: '@americanexpress/one-app-router',
    },
    'create-shared-react-context': {
      var: 'CreateSharedReactContext',
      commonjs2: 'create-shared-react-context',
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
