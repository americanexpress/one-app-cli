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

const prettier = require('prettier');
const { getFormatter } = require('../../src/utils/formatters');

jest.mock('prettier', () => ({
  format: jest.fn(() => 'formattedPrettierStringMock'),
}));

describe('formatters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(JSON, 'stringify');
    jest.spyOn(JSON, 'parse');
  });
  describe('.jsx formatter', () => {
    it('should call prettier with the correct parameters', () => {
      expect(getFormatter('.jsx')('inputStringMock')).toBe('formattedPrettierStringMock');
      expect(prettier.format).toHaveBeenCalledTimes(1);
      expect(prettier.format).toHaveBeenNthCalledWith(
        1,
        'inputStringMock',
        {
          semi: true, parser: 'babel', jsxSingleQuote: true, singleQuote: true,
        }
      );
    });
  });
  describe('.json formatter', () => {
    it('should parse then re-strignify the passed string', () => {
      expect(getFormatter('.json')('{}')).toBe('{}');
      expect(JSON.parse).toHaveBeenCalledTimes(1);
      expect(JSON.parse).toHaveBeenNthCalledWith(1, '{}');
      expect(JSON.stringify).toHaveBeenCalledTimes(1);
      // should pass the value returned from parse to stringify
      expect(JSON.stringify).toHaveBeenNthCalledWith(1, JSON.parse.mock.results[0].value, null, 2);
    });
    it('should throw if asked to parse non-json', () => {
      expect(() => getFormatter('.json')('notJson{}')).toThrow();
    });
  });
  describe('unmatched formatter', () => {
    it('should return the exact string passed', () => {
      const inputString = 'inputStringMock';
      expect(getFormatter('.other')(inputString)).toBe(inputString);
    });
  });
});
