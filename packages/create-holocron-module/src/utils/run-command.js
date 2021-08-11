/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

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
