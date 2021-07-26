const { generatorBanner, stepBanner } = require('../../src/utils/log');

jest.mock('../../package.json', () => ({
  version: 'packageVersionMock',
}));

describe('log functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log');
  });
  describe('generatorBanner', () => {
    it('should output the correct string', () => {
      generatorBanner();
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line no-console
      expect(console.log.mock.calls[0]).toMatchSnapshot();
    });
  });
  describe('stepBanner', () => {
    it('should output the correct string for all 5 steps', () => {
      stepBanner(1);
      stepBanner(2);
      stepBanner(3);
      stepBanner(4);
      stepBanner(5);
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(5);
      // snapshot all 5 calls all at once
      // eslint-disable-next-line no-console
      expect(console.log.mock.calls).toMatchSnapshot();
    });
    it('should do nothing if called with an index out of range', () => {
      stepBanner(0);
      stepBanner(-1);
      stepBanner(6);
      stepBanner(100);
      stepBanner('index');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
