/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import chalk from 'chalk';
import spawn from 'cross-spawn';

export function install(root, dependencies, { useYarn, isOnline }) {
  return new Promise((resolve, reject) => {
    let command;
    let args;

    if (useYarn) {
      command = 'yarnpkg';
      args = dependencies ? ['add', '--exact'] : ['install'];
      if (!isOnline) {
        args.push('--offline');
      }
      if (dependencies) {
        args.push(...dependencies);
      }
      args.push('--cwd', root);
      if (!isOnline) {
        console.log(chalk.yellow('You appear to be offline.'));
        console.log(chalk.yellow('Falling back to the local Yarn cache.'));
        console.log();
      }
    } else {
      command = 'npm';
      args = [
        'install',
        dependencies && '--save',
        dependencies && '--save-exact',
        '--loglevel',
        'error',
      ]
        .filter(Boolean)
        .concat(dependencies || []);
    }
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: Object.assign(Object.assign({}, process.env), {
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1', // Disable open collective messages
      }),
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` });
        return;
      }
      resolve();
    });
  });
}

export function installDevDependencies(
  root,
  dependencies,
  { useYarn, isOnline }
) {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (useYarn) {
      command = 'yarnpkg';
      args = dependencies
        ? ['add', '--exact', '--dev']
        : ['install', '--production=false'];
      if (!isOnline) {
        args.push('--offline');
      }
      if (dependencies) {
        args.push(...dependencies);
      }
      args.push('--cwd', root);
      if (!isOnline) {
        console.log(chalk.yellow('You appear to be offline.'));
        console.log(chalk.yellow('Falling back to the local Yarn cache.'));
        console.log();
      }
    } else {
      command = 'npm';
      args = [
        'install',
        dependencies && '--save-dev',
        dependencies && '--save-exact',
        '--loglevel',
        'error',
      ]
        .filter(Boolean)
        .concat(dependencies || []);
    }
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: Object.assign(Object.assign({}, process.env), {
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1', // Disable open collective messages
      }),
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` });
        return;
      }
      resolve();
    });
  });
}
