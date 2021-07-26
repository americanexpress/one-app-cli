const spawn = require('cross-spawn');
const runNpmInstall = require('../../src/utils/run-npm-install');

jest.mock('cross-spawn', () => jest.fn(() => ({
  on: jest.fn(),
})));

describe('runNpmInstall', () => {
  let subProcessMock;
  beforeEach(() => {
    jest.clearAllMocks();
    subProcessMock = {
      on: jest.fn(),
    };
    spawn.mockImplementation(() => subProcessMock);
  });
  it('should spawn a subProcess with the proper parameters', async () => {
    const promise = runNpmInstall('workingDirectoryMock', ['additionArg1', 'additionArg2']);
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenNthCalledWith(
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
      {
        cwd: 'workingDirectoryMock',
        stdio: 'inherit',
      });
  });
  it('should register an on close handler to the sub process', async () => {
    const promise = runNpmInstall('workingDirectoryMock', ['additionArg1', 'additionArg2']);
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(subProcessMock.on).toHaveBeenCalledTimes(1);
    // expecting a function to have been called with something,
    // and looking that thing up in that functions mocked parameters is not really testing anything
    // in this test we are testing that the first parameter is correct,
    // the passed function is tested in another test
    expect(subProcessMock.on).toHaveBeenNthCalledWith(1, 'close', subProcessMock.on.mock.calls[0][1]);
  });
  describe('the registered on close handler', () => {
    let promise;
    let isResolved;
    let isRejected;
    beforeEach(() => {
      promise = runNpmInstall('workingDirectoryMock', ['additionArg1', 'additionArg2']);
      isResolved = false;
      isRejected = false;
      promise
        .then(() => { isResolved = true; })
        .catch(() => {});
    });
    it('should do nothing and resolve the promise if passed 0', async () => {
      subProcessMock.on.mock.calls[0][1](0);
      await promise;
      expect(isResolved).toBe(true);
      expect(isRejected).toBe(false);
    });
    it('should reject the promise if passed not 0', async () => {
      try {
        subProcessMock.on.mock.calls[0][1](1);
        await promise;
      } catch (err) {
        isRejected = true;
        expect(err.message).toBe('Failed to execute: npm install --no-audit --save --save-exact --loglevel error additionArg1 additionArg2');
      } finally {
        expect(isResolved).toBe(false);
        expect(isRejected).toBe(true);
      }
    });
  });
});
