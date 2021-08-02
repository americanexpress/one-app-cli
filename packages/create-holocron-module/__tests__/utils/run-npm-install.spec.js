const runNpmInstall = require('../../src/utils/run-npm-install');
const runCommand = require('../../src/utils/run-command');

jest.mock('../../src/utils/run-command', () => jest.fn());

describe('runNpmInstall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call runCommand with the proper parameters', async () => {
    await runNpmInstall('workingDirectoryMock', ['additionArg1', 'additionArg2']);
    // resolve the promise by calling the registered on close function;

    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand).toHaveBeenNthCalledWith(
      1,
      'npm',
      [
        'install',
        '--no-audit',
        '--save',
        '--save-exact',
        '--loglevel',
        'error',
        'additionArg1',
        'additionArg2',
      ],
      'workingDirectoryMock'
    );
  });
});
