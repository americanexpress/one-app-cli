const { spawn } = require('child_process');

module.exports = async function spawnAndPipe(command, args, logStream) {
  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn(command, args);

    spawnedProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
      return resolve(code);
    });

    if (logStream) {
      spawnedProcess.stdout.pipe(logStream, { end: false });
      spawnedProcess.stderr.pipe(logStream, { end: false });
    } else {
      spawnedProcess.stdout.pipe(process.stdout);
      spawnedProcess.stderr.pipe(process.stderr);
    }
  });
};
