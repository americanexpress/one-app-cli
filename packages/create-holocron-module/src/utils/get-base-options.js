const prompts = require('prompts');

const getBaseOptions = () => prompts([
  {
    type: 'text',
    name: 'moduleName',
    message: 'Enter module name:',
    initial: 'my-module',
  },
]);

module.exports = getBaseOptions;
