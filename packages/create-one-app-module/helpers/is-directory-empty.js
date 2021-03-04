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
import fs from 'fs';
import path from 'path';

export function isDirectoryEmpty(root, name) {
  const validFiles = [
    '.git',
    '.gitignore',
    '.gitattributes',
    '.npmignore',
    'LICENSE',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
  ];

  const conflictedFiles = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    .filter((file) => !/\.iml$/.test(file));

  if (conflictedFiles.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflictedFiles) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${chalk.blue(file)}/`);
        } else {
          console.log(`  ${file}`);
        }
      } catch (_a) {
        console.log(`  ${file}`);
      }
    }
    console.log();
    console.log(
      'Either try using a new directory name, or remove the files listed above.'
    );
    console.log();
    return false;
  }
  return true;
}
