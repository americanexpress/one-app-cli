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

const dartSass = require('sass');
const getConfigOptions = require('../../../utils/getConfigOptions');

jest.mock('../../../utils/getConfigOptions', () => jest.fn(() => ({ purgecss: {} })));
jest.spyOn(process, 'cwd').mockImplementation(() => '/current/dir');

const {
  babelLoader,
  cssLoader,
  purgeCssLoader,
  sassLoader,
} = require('../../../webpack/loaders/common');

jest.mock('sass', () => () => 0);
describe('Common webpack loaders', () => {
  describe('babel-loader', () => {
    it('should return a config that extends the project\'s babelrc', () => {
      expect(babelLoader('modern')).toMatchSnapshot();
    });

    it('should return a config with the expected BABEL_ENV', () => {
      expect(babelLoader('legacy')).toMatchSnapshot();
    });
  });

  describe('css-loader', () => {
    it('should use the css-loader', () => {
      const config = cssLoader();
      expect(config.loader).toBe('css-loader');
      expect(config).toMatchSnapshot();
    });
    it('should use the chunk name in the localIdentName when given', () => {
      const name = 'my-chunk';
      const config = cssLoader({ name });
      expect(config.options.modules.localIdentName).toBe(`${name}__[name]__[local]___[hash:base64:5]`);
      expect(config).toMatchSnapshot();
    });
    it('should still return a good localIdentName when not given a chunk name', () => {
      const config = cssLoader();
      expect(config.options.modules.localIdentName).toBe('[name]__[local]___[hash:base64:5]');
      expect(config).toMatchSnapshot();
    });
    it('should still return localName from getLocalIdent if resourcePath includes node_modules', () => {
      const config = cssLoader();
      const loaderContext = {
        resourcePath: 'node_modules/some-library/some-library.min.css',
      };
      const localIdentName = '[name]__[local]___[hash:base64:5]';
      const localName = 'horizontal';
      const options = { context: undefined, hashPrefix: '', regExp: null };

      const result = config.options.modules.getLocalIdent(
        loaderContext, localIdentName, localName, options
      );

      expect(result).toEqual(localName);
      expect(config).toMatchSnapshot();
    });
    it('should still return null from getLocalIdent if resourcePath does not include node_modules', () => {
      const config = cssLoader();
      const loaderContext = {
        resourcePath: 'my-module/src/components/module.scss',
      };
      const localIdentName = '[name]__[local]___[hash:base64:5]';
      const localName = 'horizontal';
      const options = { context: undefined, hashPrefix: '', regExp: null };

      const result = config.options.modules.getLocalIdent(
        loaderContext, localIdentName, localName, options
      );

      expect(result).toEqual(null);
      expect(config).toMatchSnapshot();
    });
  });

  describe('purgecss-loader', () => {
    it('should return a config that accounts for the src dir', () => {
      expect(purgeCssLoader()).toMatchSnapshot();
    });

    it('should include any additional configured paths', () => {
      getConfigOptions.mockReturnValueOnce({ purgecss: { paths: ['foo', 'bar'] } });
      expect(purgeCssLoader()).toMatchSnapshot();
    });

    it('should include any additional configured options', () => {
      const purgecss = {
        paths: ['foo', 'bar'],
        extractors: [{
          extractor: 'purgeJs',
          extensions: ['js'],
        }],
        fontFace: true,
        keyframes: true,
        variables: true,
        /* eslint-disable inclusive-language/use-inclusive-words --
        config options for a third party library */
        whitelist: ['random', 'yep', 'button'],
        whitelistPatterns: ['red'],
        whitelistPatternsChildren: ['blue'],
        /* eslint-enable -- disables require enables */
      };
      getConfigOptions.mockReturnValueOnce({ purgecss });
      expect(purgeCssLoader()).toMatchSnapshot();
    });

    it('should return an empty object when disabled', () => {
      getConfigOptions.mockReturnValueOnce({ purgecss: { disabled: true } });
      expect(purgeCssLoader()).toEqual([]);
    });
  });

  describe('sass-loader', () => {
    it('should return a config using dart sass', () => {
      const config = sassLoader();
      expect(config.options.implementation).toBe(dartSass);
      expect(config).toMatchSnapshot();
    });
  });
});
