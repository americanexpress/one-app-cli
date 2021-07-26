
const runNpmInstall = require('./run-npm-install');

const installTemplate = (templateName) => runNpmInstall(__dirname, [templateName]);

module.exports = installTemplate;
