const prompts = require('prompts');

const getModuleOpts = (opts) => prompts([
  {
    type: opts.moduleName ? null : 'text',
    name: 'moduleName',
    message: 'Enter module name:',
    initial: 'my-module',
  },
  {
    type: opts.rootModule ? null : 'confirm',
    name: 'rootModule',
    message: 'Create as a root module:',
    initial: false,
  },
]);

module.exports = getModuleOpts;
