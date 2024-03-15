const { spawn } = require('child_process');

module.exports = async function asyncSpawn(command, args) {
  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn(command, args);

    let stdout = Buffer.from('');
    let stderr = Buffer.from('');

    spawnedProcess.stdout.on('data', (chunk) => {
      stdout = Buffer.concat([stdout, chunk]);
    });

    spawnedProcess.stderr.on('data', (chunk) => {
      stderr = Buffer.concat([stderr, chunk]);
    });

    spawnedProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(Object.assign(new Error('process exited with an error'), { code, stdout, stderr }));
      }
      return resolve({ code, stdout, stderr });
    });
  });
};
