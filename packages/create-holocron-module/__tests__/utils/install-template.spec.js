const path = require('path');
const runNpmInstall = require('../../src/utils/run-npm-install');
const installTemplate = require('../../src/utils/install-template');

jest.mock('../../src/utils/run-npm-install', () => jest.fn(() => 'npmInstallResponseMock'));

describe('installTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should runNpmInstall with the correct parameters', () => {
    expect(installTemplate('templateNameMock')).toBe('npmInstallResponseMock');
    expect(runNpmInstall).toHaveBeenCalledTimes(1);
    expect(runNpmInstall).toHaveBeenNthCalledWith(1, path.resolve(`${__dirname}/../../src/utils/`), ['templateNameMock']);
  });
});
