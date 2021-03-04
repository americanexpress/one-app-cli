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

import retry from 'async-retry';
import chalk from 'chalk';
import cpy from 'cpy';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  downloadAndExtractExample,
  downloadAndExtractRepository,
  getRepositoryInformation,
  hasExample,
  hasRepository,
} from './helpers/get-examples';
import { makeDirectory } from './helpers/make-directory';
import { tryGitInit } from './helpers/git';
import { install, installDevDependencies } from './helpers/install';
import { isDirectoryEmpty } from './helpers/is-directory-empty';
import { getOnline } from './helpers/is-online';
import { shouldUseYarn } from './helpers/use-yarn';

export class DownloadError extends Error {}

// eslint-disable-next-line complexity
export async function createModule({ appPath, useNpm, example, examplePath }) {
  let repoInfo;
  if (example) {
    let repoUrl;
    try {
      repoUrl = new URL(example);
    } catch (error) {
      if (error.code !== 'ERR_INVALID_URL') {
        console.error(error);
        process.exit(1);
      }
    }
    if (repoUrl) {
      repoInfo = await getRepositoryInformation(repoUrl, examplePath);
      if (!repoInfo) {
        console.error(
          `Found invalid GitHub URL: ${chalk.red(
            `"${example}"`
          )}. Please fix the URL and try again.`
        );
        process.exit(1);
      }
      const found = await hasRepository(repoInfo);
      if (!found) {
        console.error(
          `Could not locate the repository for ${chalk.red(
            `"${example}"`
          )}. Please check that the repository exists and try again.`
        );
        process.exit(1);
      }
    } else {
      const found = await hasExample(example);
      if (!found) {
        console.error(
          `Could not locate an example named ${chalk.red(
            `"${example}"`
          )}. Please check your spelling and try again.`
        );
        process.exit(1);
      }
    }
  }
  const root = path.resolve(appPath);
  const appName = path.basename(root);
  await makeDirectory(root);
  if (!isDirectoryEmpty(root, appName)) {
    process.exit(1);
  }
  const useYarn = useNpm ? false : shouldUseYarn();
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();
  const displayedCommand = useYarn ? 'yarn' : 'npm';
  console.log(`Creating a new One App module in ${chalk.green(root)}.`);
  console.log();
  await makeDirectory(root);
  process.chdir(root);
  if (example) {
    try {
      if (repoInfo) {
        const repoInfo2 = repoInfo;
        console.log(
          `Downloading files from repo ${chalk.cyan(
            example
          )}. This might take a moment.`
        );
        console.log();
        await retry(() => downloadAndExtractRepository(root, repoInfo2), {
          retries: 3,
        });
      } else {
        console.log(
          `Downloading files for example ${chalk.cyan(
            example
          )}. This might take a moment.`
        );
        console.log();
        await retry(() => downloadAndExtractExample(root, example), {
          retries: 3,
        });
      }
    } catch (reason) {
      throw new DownloadError(reason);
    }
    // Copy our default `.gitignore` if the application did not provide one
    const ignorePath = path.join(root, '.gitignore');
    if (!fs.existsSync(ignorePath)) {
      fs.copyFileSync(
        path.join(__dirname, 'templates', 'default', 'gitignore'),
        ignorePath
      );
    }
    console.log('Installing packages. This might take a couple of minutes.');
    console.log();
    await install(root, null, { useYarn, isOnline });
    console.log();
  } else {
    const packageJson = {
      name: appName,
      version: '0.0.1',
      private: false,
      scripts: {
        build: 'bundle-module',
        clean: 'rimraf build',
        prebuild: 'npm run clean',
        start: 'one-app-runner',
        test: 'npm run test:lint && npm run test:unit',
        'test:lint': 'eslint --ignore-path .gitignore --ext js,jsx,snap .',
        'test:unit': 'jest',
        'watch:build': 'npm run build -- --watch',
      },
      jest: {
        preset: 'amex-jest-preset-react',
      },
      'one-amex': {
        runner: {
          dockerImage: 'oneamex/one-app-dev:latest',
          modules: ['.'],
        },
      },
    };
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify(packageJson, null, 2) + os.EOL
    );
    console.log(`Installing dependencies using ${displayedCommand}...`);
    console.log();
    await install(root, ['react', 'react-dom'], { useYarn, isOnline });
    await installDevDependencies(
      root,
      [
        '@americanexpress/one-app-bundler',
        '@americanexpress/one-app-runner',
        'amex-jest-preset-react',
        'babel-eslint',
        'babel-preset-amex',
        'enzyme',
        'enzyme-to-json',
        'eslint',
        'eslint-config-amex',
        'jest',
        'rimraf',
      ],
      { useYarn, isOnline }
    );
    console.log();
    await cpy('**', root, {
      parents: true,
      cwd: path.join(__dirname, 'templates', 'default'),
      rename: (name) => {
        console.log('Name: ', name);
        switch (name) {
          case 'gitignore': {
            return '.'.concat(name);
          }
          case 'babelrc': {
            return '.'.concat(name);
          }
          case 'eslintrc.json': {
            return '.'.concat(name);
          }
          // README.md is ignored by webpack-asset-relocator-loader used by ncc:
          // https://github.com/zeit/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
          case 'README-template.md': {
            return 'README.md';
          }
          default: {
            return name;
          }
        }
      },
    });
  }
  if (tryGitInit(root)) {
    console.log('Initialized a git repository.');
    console.log();
  }
  let cdpath;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }
  console.log(`${chalk.green('Success!')} Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}dev`));
  console.log('    Starts the development server.');
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`)
  );
  console.log('    Builds the app for production.');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log('    Runs the built app in production mode.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(
    `  ${chalk.cyan(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`
  );
  console.log();
}
