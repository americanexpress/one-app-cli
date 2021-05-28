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

import path from 'path';
import { execSync, execFileSync, spawnSync } from 'child_process';

import { ufs } from './virtual-file-system';
import {
  getOneAppPath, getStaticPath, getTempPath, STATIC_DIR,
} from './paths';
import {
  logError,
  logGitIgnoreAddition,
  logPullingDockerImage,
  logOneAppVersion,
  logStaticStep,
} from './logs';
import { libraryName, oneAppDockerImageName } from '../constants';

export function addStaticsDirToGitIgnore() {
  // adds static/ to .gitignore only once
  const gitIgnorePath = path.resolve('.gitignore');
  if (ufs.existsSync(gitIgnorePath)) {
    const gitIgnoreAddition = [`# added by ${libraryName}`, `${STATIC_DIR}/`].join('\n');
    if (!ufs.readFileSync(gitIgnorePath).toString().includes(gitIgnoreAddition)) {
      logGitIgnoreAddition();
      execSync(`echo "\n${gitIgnoreAddition}" >> ${gitIgnorePath}`);
    }
  }
}

export function loadOneAppStaticsFromDocker({
  tempDir = getTempPath(),
  appDir = getOneAppPath(),
  dockerImage = oneAppDockerImageName,
} = {}) {
  try {
    logPullingDockerImage();

    // TODO: spinner while loading, use spawn
    // TODO: replace stdout with meaningful feedback instead of docker output
    execFileSync('docker', ['pull', dockerImage], { stdio: 'inherit' });
    const imageId = execFileSync('docker', ['create', dockerImage]).toString().trim();
    execFileSync('docker', ['cp', `${imageId}:opt/one-app/build/`, tempDir], {
      stdio: 'inherit',
    });

    const [appVersion] = ufs.readdirSync(path.join(tempDir, 'app'));
    logOneAppVersion(appVersion);

    spawnSync('mv', [path.join(tempDir, 'app', appVersion), appDir], {
      stdio: 'inherit',
    });
    spawnSync('rm', ['-R', tempDir], { stdio: 'inherit' });
  } catch (e) {
    logError(e);
  }
}

export function loadStatics(config = {}) {
  logStaticStep();
  const outputDir = getStaticPath();
  if (!ufs.existsSync(outputDir)) ufs.mkdirSync(outputDir);
  if (!ufs.existsSync(getOneAppPath())) {
    const { dockerImage } = config;
    loadOneAppStaticsFromDocker({
      dockerImage,
    });
  }
  addStaticsDirToGitIgnore();
}
