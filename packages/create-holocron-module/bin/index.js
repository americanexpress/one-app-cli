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
const packageJson = require('../package.json');
const generateFromTemplate = require('../src/generate-from-template');

let templateName;

const program = new Command();
program
  .version(packageJson.version)
  .description(packageJson.description)
  .arguments('[templateName]')
  .action((name) => {
    templateName = name;
  })
  .allowUnknownOption()
  .parse();

const run = async () => {
  const programOpts = program.opts();
  await generateFromTemplate({
    templateName,
    ...programOpts,
  });
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to create module:', err.message);
  console.error(err);
  process.exit(1);
});
