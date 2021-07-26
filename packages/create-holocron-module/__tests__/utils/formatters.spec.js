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
