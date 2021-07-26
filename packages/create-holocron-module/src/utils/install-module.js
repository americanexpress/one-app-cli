const runNpmInstall = require('./run-npm-install');

const installModule = (moduleWorkingDirectory) => runNpmInstall(moduleWorkingDirectory);

module.exports = installModule;
