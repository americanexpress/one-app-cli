const getExternalLibraryName = require('./getExternalLibraryName');

const getRegisterExternalStr = (name, version) => `Holocron.registerExternal({ name: "${name}", version: "${version}", module: ${getExternalLibraryName(name)}});`;

module.exports = getRegisterExternalStr;
