import AppConfig from '../src/appConfig';

describe('appConfig', () => {
  it('should contain accurate csp', () => {
    expect(AppConfig.csp).toBeDefined();
    expect(typeof AppConfig.csp).toBe('string');
  });

  describe('csp', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env.ONE_CLIENT_REPORTING_URL = 'example.com';
    });

    it('should take the HTTP_ONE_APP_DEV_CDN_PORT environment variable into account for local development csp additions', () => {
      process.env.NODE_ENV = 'development';
      process.env.HTTP_ONE_APP_DEV_CDN_PORT = 5000;
      // eslint-disable-next-line global-require
      const cspString = require('../src/csp').default;
      // replaces local ip with 0.0.0.0 for consistent snapshots
      const sanitizedCspString = cspString.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:5000/g, '0.0.0.0:5000');
      expect(sanitizedCspString).toMatchSnapshot();
    });

    it('should contain a valid csp string with local development csp additions if NODE_ENV is set to development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.HTTP_ONE_APP_DEV_CDN_PORT;
      // eslint-disable-next-line global-require
      const cspString = require('../src/csp').default;
      const sanitizedCspString = cspString.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:3001/g, '0.0.0.0:3001');
      expect(sanitizedCspString).toMatchSnapshot();
    });

    it('should contain a valid csp string without local development csp additions if NODE_ENV is set to production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.HTTP_ONE_APP_DEV_CDN_PORT;
      // eslint-disable-next-line global-require
      const cspString = require('../src/csp').default;
      const ipFound = cspString.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:3001/);
      expect(ipFound).toBeNull();
      const localhostFound = cspString.match(/localhost:3001/);
      expect(localhostFound).toBeNull();
      expect(cspString).toMatchSnapshot();
    });
  });
});
