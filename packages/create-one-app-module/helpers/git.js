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

const { execSync } = require('child_process');
const path = require('path');
const rimraf = require('rimraf');

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (error) {}
  return false;
}

function tryGitInit(root) {
  let didInit = false;
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository()) {
      console.log('IN HERE');
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInit = true;
    // Default it to `main` branch
    execSync('git checkout -b main', { stdio: 'ignore' });

    execSync('git add -A', { stdio: 'ignore' });
    // Initial commit message (53 characters long)
    execSync(
      'git commit -m "feat(init): initial commit from create-one-app-module"',
      {
        stdio: 'ignore',
      }
    );
    return true;
  } catch (e) {
    console.log('IN CATCH');
    if (didInit) {
      try {
        rimraf.sync(path.join(root, '.git'));
      } catch (_) {}
    }
    return false;
  }
}

module.exports = {
  isInGitRepository,
  tryGitInit,
};
