const spawn = require('cross-spawn');

const installTemplate = (templateName) => new Promise((resolve, reject) => {
  const command = 'npm';
  const args = [
    'install',
    '--no-audit',
    '--save',
    '--save-exact',
    '--loglevel',
    'error',
  ].concat(templateName);

  const child = spawn(command, args, { stdio: 'inherit', cwd: __dirname });
  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Failed to execute: ${command} ${args.join(' ')}`));
      return;
    }
    resolve();
  });
});

module.exports = installTemplate;
