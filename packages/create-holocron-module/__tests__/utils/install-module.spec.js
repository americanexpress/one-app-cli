const runNpmInstall = require('../../src/utils/run-npm-install');
const installModule = require('../../src/utils/install-module');

jest.mock('../../src/utils/run-npm-install', () => jest.fn(() => 'npmInstallResponseMock'));

describe('installModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should runNpmInstall with the correct parameters', () => {
    expect(installModule('workingDirectoryMock')).toBe('npmInstallResponseMock');
    expect(runNpmInstall).toHaveBeenCalledTimes(1);
    expect(runNpmInstall).toHaveBeenNthCalledWith(1, 'workingDirectoryMock');
  });
});
