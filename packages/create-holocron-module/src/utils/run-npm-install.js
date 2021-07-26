const spawn = require('cross-spawn');

const runNpmInstall = (workingDirectory, additionalArgs = []) => new Promise((resolve, reject) => {
  const command = 'npm';
  const args = [
    'install',
    '--no-audit',
    '--save',
    '--save-exact',
    '--loglevel',
    'error',
  ].concat(additionalArgs);

  const subProcess = spawn(command, args, { stdio: 'inherit', cwd: workingDirectory });
  subProcess.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Failed to execute: ${command} ${args.join(' ')}`));
      return;
    }
    resolve();
  });
});

module.exports = runNpmInstall;
