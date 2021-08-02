const spawn = require('cross-spawn');

const runCommand = (command, args = [], workingDirectory = './') => new Promise((resolve, reject) => {
  const subProcess = spawn(command, args, { stdio: 'inherit', cwd: workingDirectory });
  subProcess.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Failed to execute: ${command} ${args.join(' ')}`));
      return;
    }
    resolve();
  });
});

module.exports = runCommand;
