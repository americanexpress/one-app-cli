const runCommand = require('./run-command');

const initializeGitRepo = async (repoPath) => {
  await runCommand('git', ['init'], repoPath);
  await runCommand('git', ['add', '.'], repoPath);
  await runCommand('git', ['commit', '-mfeat(generation): initial commit'], repoPath);
  await runCommand('git', ['branch', '-m', 'main'], repoPath);
};

module.exports = initializeGitRepo;
