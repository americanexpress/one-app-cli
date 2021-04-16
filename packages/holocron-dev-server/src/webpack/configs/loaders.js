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

import TerserPlugin from 'terser-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { ESBuildMinifyPlugin } from 'esbuild-loader';

import {
  modulesLibraryVarName,
  getWebpackVersion,
  assetModuleFilename,
  nodeModulesPattern,
  jsxTest,
  fileTest,
  cssTest,
} from '../helpers';

export const fileLoader = ({ test = fileTest } = {}) => {
  const webpackVersion = getWebpackVersion();
  const fragment = {
    module: {
      rules: [],
    },
  };

  if (webpackVersion >= 5) {
    fragment.module.rules.push({
      test,
      type: 'asset/resource',
    });
    fragment.output = {
      assetModuleFilename,
    };
  } else {
    // v4 and down
    fragment.module.rules.push({
      test,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: assetModuleFilename,
          },
        },
      ],
    });
  }

  const [rule] = fragment.module.rules;
  return {
    rule,
    fragment,
  };
};

export const cssLoader = ({
  test = cssTest,
  exclude = nodeModulesPattern,
  include,
  sourceMap,
  hot = true,
  modules = true,
  inline = true,
  postcss = true,
} = {}) => {
  const loaders = [
    {
      loader: 'sass-loader',
    },
  ];

  if (postcss) {
    loaders.push({
      loader: 'postcss-loader',
      options: {
        sourceMap,
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
    });
  }

  loaders.unshift({
    loader: 'css-loader',
    options: {
      importLoaders: loaders.length,
      modules: modules && {
        localIdentName: '[name]__[local]___[contenthash:base64:5]',
      },
    },
  });

  if (hot || inline) {
    loaders.unshift({
      loader: 'style-loader',
    });
  }

  // TODO: instead of inlining css, extract to css static

  const rule = {
    test,
    exclude,
    include,
    use: loaders,
  };

  return {
    rule,
    fragment: {
      module: {
        rules: [rule],
      },
    },
  };
};

export const jsxLoader = ({
  // plugins and presets are the babel config passed to the loader
  plugins = [],
  presets = [],
  babelrc = false,
  // loader config
  test = jsxTest,
  hot = false,
  cache = true,
  exclude,
  include,
} = {}) => {
  if (hot) {
    plugins.unshift(require.resolve('react-refresh/babel'));
  }
  const rule = {
    test,
    // eg exclude: /node_modules/, ['my-transpiled-package', ...]
    exclude,
    include,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: cache,
          babelrc,
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
            ...presets,
          ],
          plugins,
        },
      },
    ],
  };

  return {
    rule,
    fragment: {
      module: {
        rules: [rule],
      },
    },
  };
};

export function createJavaScriptSourceLoadersConfigFragment({
  terserOptions,
  purgeCssOptions,
  minify,
  hot,
} = {}) {
  const fragment = {
    module: {
      rules: [
        fileLoader().rule,
        cssLoader({ purgeCssOptions, hot }).rule,
        jsxLoader({ hot }).rule,
      ],
    },
  };

  if (hot) {
    fragment.plugins = [
      new ReactRefreshWebpackPlugin({
        forceEnable: hot,
        library: modulesLibraryVarName,
        overlay: {
          sockIntegration: 'whm',
        },
      }),
    ];
  }

  if (minify) {
    fragment.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: jsxTest,
          terserOptions,
        }),
      ],
    };
  }

  return fragment;
}

export function createEsBuildConfigFragment({
  minify = false,
  target = 'es2015',
  loader = 'jsx',
  test = jsxTest,
} = {}) {
  const fragment = {
    module: {
      rules: [
        {
          test,
          loader: require.resolve('esbuild-loader'),
          options: {
            loader,
            target,
          },
        },
      ],
    },
  };

  if (minify) {
    fragment.optimization = {
      minimize: true,
      minimizer: [
        new ESBuildMinifyPlugin({
          target,
          minifyWhitespace: false,
          minifyIdentifiers: false,
          minifySyntax: false,
          exclude: [/.*\.min\.js$/],
        }),
      ],
    };
  }

  return fragment;
}