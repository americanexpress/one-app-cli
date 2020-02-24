import AppConfig from '../src/appConfig';

describe('appConfig', () => {
  it('should contain csp', () => {
    expect(AppConfig.csp).toBeDefined();
    expect(typeof AppConfig.csp).toBe('string');
  });

  describe('csp', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env.ONE_CLIENT_REPORTING_URL = 'example.com';
    });
    
    it('should be a valid csp string', () => {
      // eslint-disable-next-line global-require
      const cspString = require('../src/csp').default;
      expect(cspString).toMatchSnapshot();
    });
  });
});
