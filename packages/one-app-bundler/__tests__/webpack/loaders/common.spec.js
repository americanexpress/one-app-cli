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
  reconcileSafeList,
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
    describe('resourcePath includes node_modules', () => {
      it('should return localName from getLocalIdent if the file is not a module', () => {
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
      it('should return null from getLocalIndent if the file is a module', () => {
        const config = cssLoader();
        const loaderContext = {
          resourcePath: 'node_modules/some-library/file.module.css',
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

    it('should include purgecss 2 configuration in purgecss 3 format', () => {
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
      const configured = purgeCssLoader();
      expect(configured[0].options.blocklist).toEqual([]);
      expect(configured[0].options.safelist.standard).toEqual([/red/i, 'random', 'yep', 'button']);
      expect(configured[0].options.safelist.deep).toEqual([/blue/i]);
    });

    it('should return an empty object when disabled', () => {
      getConfigOptions.mockReturnValueOnce({ purgecss: { disabled: true } });
      expect(purgeCssLoader()).toEqual([]);
    });
    it('should include purgecss 3 configuration options', () => {
      const purgecss = {
        paths: ['foo', 'bar'],
        extractors: [{
          extractor: 'purgeJs',
          extensions: ['js'],
        }],
        fontFace: true,
        keyframes: true,
        variables: true,
        safelist: {
          standard: ['random'],
          deep: ['randomdeep'],
          greedy: ['randomgreedy'],
          keyframes: true,
          variables: true,
        },
        blocklist: ['blockClass'],
      };
      getConfigOptions.mockReturnValueOnce({ purgecss });
      const configured = purgeCssLoader();
      expect(configured[0].options.safelist).toEqual({
        standard: ['random'],
        deep: [/randomdeep/i],
        greedy: [/randomgreedy/i],
        keyframes: true,
        variables: true,
      });
      expect(configured[0].options.blocklist).toEqual(['blockClass']);
    });
    it('should not modify safelist if it is an array', () => {
      const purgecss = {
        paths: ['foo', 'bar'],
        extractors: [{
          extractor: 'purgeJs',
          extensions: ['js'],
        }],
        fontFace: true,
        keyframes: true,
        variables: true,
        safelist: ['red'],
        blocklist: ['blockClass'],
      };
      getConfigOptions.mockReturnValueOnce({ purgecss });
      const configured = purgeCssLoader();
      expect(configured[0].options.safelist).toEqual(['red']);
    });
  });
  describe('reconcileSafeList', () => {
    it('should insert deep and greedy defaults if not present', async () => {
      const safelist = {
        standard: ['random'],
        keyframes: true,
        variables: true,
      };
      const reconciledSafeList = reconcileSafeList(safelist);
      expect(reconciledSafeList).toEqual({
        deep: [/:global$/], greedy: [], keyframes: true, standard: ['random'], variables: true,
      });
    });
    it('should not modfify safelist', async () => {
      const purgecss = {
        paths: ['foo', 'bar'],
        extractors: [{
          extractor: 'purgeJs',
          extensions: ['js'],
        }],
        fontFace: true,
        keyframes: true,
        variables: true,
        safelist: ['random'],
        blocklist: ['blockClass'],
      };
      getConfigOptions.mockReturnValueOnce({ purgecss });
      const configured = purgeCssLoader();
      expect(configured[0].options.safelist).toEqual(['random']);
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
