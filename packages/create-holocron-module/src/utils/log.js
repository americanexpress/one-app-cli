/* eslint-disable no-console */
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

const pack = require('../../package.json');

const generatorBanner = () => {
  console.log(' \n'
    + '\n'
    + '\n'
    + '     ██████╗ ███╗   ██╗███████╗     █████╗ ██████╗ ██████╗ \n'
    + '    ██╔═══██╗████╗  ██║██╔════╝    ██╔══██╗██╔══██╗██╔══██╗\n'
    + '    ██║   ██║██╔██╗ ██║█████╗      ███████║██████╔╝██████╔╝\n'
    + '    ██║   ██║██║╚██╗██║██╔══╝      ██╔══██║██╔═══╝ ██╔═══╝ \n'
    + '    ╚██████╔╝██║ ╚████║███████╗    ██║  ██║██║     ██║     \n'
    + '     ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚═╝  ╚═╝╚═╝     ╚═╝     \n'
    + '\n'
    + '                https://github.com/americanexpress/one-app\n'
    + '\n'
    + `Welcome to One App Generator v${pack.version}\n`
    + 'Application files will be generated in folder: <location>\n'
    + '________________________________________________________________________________\n'
    + '\n'
    + 'Documentation for One App is at https://github.com/americanexpress/one-app\n'
    + '________________________________________________________________________________');
};

const stepBanners = [
  `
Step 1
Load the template
________________________________________________________________________________
`,
  `
Step 2
Gather parameters
________________________________________________________________________________
`,
  `
Step 3
Generate Module
________________________________________________________________________________
`,
  `
Step 4
Silently install, build and test the module, this may take a minute
________________________________________________________________________________
`,
  `
Step 5
Initialize git
________________________________________________________________________________
`,
];

const stepBanner = (step) => {
  if (stepBanners[step - 1] !== undefined) {
    console.log(stepBanners[step - 1]);
  }
};

module.exports = {
  generatorBanner,
  stepBanner,
};
