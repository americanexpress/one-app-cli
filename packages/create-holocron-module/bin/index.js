#! /usr/bin/env node

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

const { Command } = require('commander');
const createHolocronModule = require('../src/create-holocron-module');
const packageJson = require('../package.json');
const getModuleOpts = require('../src/prompt-user');

let moduleName;

const program = new Command();
program
  .version(packageJson.version)
  .description(packageJson.description)
  .arguments('[moduleName]')
  .action((name) => {
    moduleName = name;
  })
  .allowUnknownOption()
  .option('-t, --template <template-path>', 'Path to Holocron module template')
  .option('-r, --rootModule', 'Root Module')
  .parse();

const run = async () => {
  const programOpts = program.opts();
  const moduleOpts = await getModuleOpts({ moduleName, ...programOpts });
  await createHolocronModule({
    moduleName,
    ...programOpts,
    ...moduleOpts,
  });
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to create module:', err.message);
  process.exit(1);
});
