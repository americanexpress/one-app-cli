/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import fs from 'fs';
import path from 'path';
import { exec, execSync, spawnSync } from 'child_process';

import {
  getStaticPath, STATIC_DIR, TEMP_DIR,
} from './webpack/utility';
import { error, time } from './logs';

export function loadOneAppStaticsFromDocker({ tempDir, appDir, dockerImage } = {}) {
  execSync(`docker pull ${dockerImage}`, { stdio: 'inherit' });
  // TODO: consider windows for file paths
  execSync(
    `docker cp $(docker create ${dockerImage}):opt/one-app/build/ ./.temp`,
    { stdio: 'inherit' }
  );

  const [appVersion] = fs.readdirSync('.temp/app');
  spawnSync('mv', [path.join(tempDir, 'app', appVersion), appDir], {
    stdio: 'inherit',
  });
  spawnSync('rm', ['-R', tempDir], { stdio: 'inherit' });
}

export function loadOneAppStaticsFromGit() {
  // TODO: add alternative source for one-app statics (git)
  error('NOT IMPLEMENTED');
}

export function preloadOneAppStatics(config = {}) {
  const { oneAppSource = 'docker', dockerImage } = config;

  const outputDir = path.resolve(STATIC_DIR);
  const appDir = path.join(outputDir, 'app');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  if (!fs.existsSync(appDir)) {
    if (oneAppSource === 'docker') {
      loadOneAppStaticsFromDocker({
        // TODO: change to TMP_DIR
        tempDir: TEMP_DIR,
        appDir,
        dockerImage,
      });
    } else if (oneAppSource === 'git') {
      loadOneAppStaticsFromGit();
    }
  }

  // TODO: double check if we still need to do this
  // overwrite eval to allow HMR
  fs.writeFileSync(
    getStaticPath('app/app.js'),
    fs.readFileSync(getStaticPath('app/app.js')).toString().replace("['eval', 'execScript']", '[]')
  );
}

export function modifySource() {
  // adds static/ to .gitignore only once
  const gitIgnorePath = path.resolve('.gitignore');
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnoreAddition = [
      '# added by one-app-hmr',
      'static/',
    ].join('\n');
    if (!fs.readFileSync(gitIgnorePath).toString().includes(gitIgnoreAddition)) {
      exec(`echo "\n${gitIgnoreAddition}" >> ${gitIgnorePath}`);
    }
  }
}

export async function setupStatics(config) {
  await time('setting up static', async () => {
    await preloadOneAppStatics(config);
    // update gitignore to include static
    modifySource(config);
  });
}
