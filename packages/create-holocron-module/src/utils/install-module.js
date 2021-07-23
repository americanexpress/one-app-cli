const spawn = require('cross-spawn');

const installModule = (moduleWorkingDirectory) => new Promise((resolve, reject) => {
  const command = 'npm';
  const args = [
    'install',
    '--no-audit',
    '--save',
    '--save-exact',
    '--loglevel',
    'error',
  ];

  const child = spawn(command, args, { stdio: 'inherit', cwd: moduleWorkingDirectory });
  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Failed to execute: ${command} ${args.join(' ')}`));
      return;
    }
    resolve();
  });
});

module.exports = installModule;
