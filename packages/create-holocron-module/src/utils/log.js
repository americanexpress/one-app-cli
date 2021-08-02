/* eslint-disable no-console */
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
