#!/usr/bin/env node

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
/* eslint-disable complexity */

import chalk from 'chalk';
import Commander from 'commander';
import path from 'path';
import prompts from 'prompts';
import checkForUpdate from 'update-check';
import { createModule, DownloadError } from './create-module';
import { shouldUseYarn } from './helpers/use-yarn';
import { validateNpmName } from './helpers/validate-package-name';
import packageJson from './package.json';

let modulePath = '';
const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('[project-directory]')
  .usage(`${chalk.green('[project-directory]')} [options]`)
  .action((name) => {
    modulePath = name;
  })
  .option('--use-npm')
  .option(
    '-e, --example [name]|[repo-url]',
    `
    An example to bootstrap the app with. You can use an example name
    from the One App Tools repo or a GitHub URL. The URL can use
    any branch and/or subdirectory
    `
  )
  .option(
    '--example-path <path-to-example>',
    `
  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`
  )
  .allowUnknownOption()
  .parse(process.argv);

async function run() {
  if (typeof modulePath === 'string') {
    modulePath = modulePath.trim();
  }
  if (!modulePath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is your module name?',
      initial: 'my-module',
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return `Invalid project name: ${validation.problems[0]}`;
      },
    });
    if (typeof res.path === 'string') {
      modulePath = res.path.trim();
    }
  }
  if (!modulePath) {
    console.log();
    console.log('Please specify the project directory:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-module')}`);
    console.log();
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }
  const resolvedModulePath = path.resolve(modulePath);
  const moduleName = path.basename(resolvedModulePath);
  const { valid, problems } = validateNpmName(moduleName);
  const options = program.opts();
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${moduleName}"`
      )} because of npm naming restrictions:`
    );
    problems.forEach((p) => console.error(`    ${chalk.red.bold('*')} ${p}`));
    process.exit(1);
  }
  if (options.example === true) {
    console.error(
      'Please provide an example name or url, otherwise remove the example option.'
    );
    process.exit(1);
    return;
  }
  const example = typeof options.example === 'string' && options.example.trim();

  try {
    await createModule({
      appPath: resolvedModulePath,
      useNpm: !!options.useNpm,
      example: example && example !== 'default' ? example : undefined,
      examplePath: options.examplePath,
    });
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason;
    }
    const res = await prompts({
      type: 'confirm',
      name: 'builtin',
      message:
        `Could not download "${example}" because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template instead?`,
      initial: true,
    });
    if (!res.builtin) {
      throw reason;
    }
    await createModule({
      appPath: resolvedModulePath,
      useNpm: !!options.useNpm,
    });
  }
}
const update = checkForUpdate(packageJson).catch(() => null);
async function notifyUpdate() {
  try {
    const res = await update;
    // eslint-disable-next-line no-void
    if (res === null || res === void 0 ? void 0 : res.latest) {
      const isYarn = shouldUseYarn();
      console.log();
      console.log(
        chalk.yellow.bold(
          'A new version of `create-one-app-module` is available!'
        )
      );
      console.log(
        `You can update by running: ${chalk.cyan(
          isYarn
            ? 'yarn global add create-one-app-module'
            : 'npm i -g create-one-app-module'
        )}`
      );
      console.log();
    }
    process.exit();
  } catch (_a) {}
}
run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log('Aborting installation.');
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'));
      console.log(reason);
    }
    console.log();
    await notifyUpdate();
    process.exit(1);
  });
