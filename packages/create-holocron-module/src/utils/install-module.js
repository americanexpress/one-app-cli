const runNpmInstall = require('./run-npm-install');

const installModule = (moduleWorkingDirectory) => runNpmInstall(moduleWorkingDirectory, ['--prefer-offline']);

module.exports = installModule;
