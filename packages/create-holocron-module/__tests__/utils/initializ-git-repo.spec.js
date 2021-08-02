const initializeGitRepo = require('../../src/utils/initialize-git-repo');
const runCommand = require('../../src/utils/run-command');

jest.mock('../../src/utils/run-command', () => jest.fn());

describe('initializeGitRepo', () => {
  it('should initialize a git repo with a passabe commit message on the main branch', async () => {
    await initializeGitRepo('repoPathMock');

    expect(runCommand.mock.calls).toMatchSnapshot();
  });
});
