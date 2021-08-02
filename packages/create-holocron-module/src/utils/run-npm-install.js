const runCommand = require('./run-command');

const runNpmInstall = async (workingDirectory, additionalArgs = []) => {
  const command = 'npm';
  const args = [
    'install',
    '--progress=false',
    '--no-audit',
    '--save',
    '--save-exact',
    '--loglevel',
    'error',
  ].concat(additionalArgs);

  await runCommand(command, args, workingDirectory);
};

module.exports = runNpmInstall;
