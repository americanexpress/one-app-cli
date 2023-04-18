const { snakeCase } = require('lodash');
const { EXTERNAL_PREFIX } = require('..');

const getExternalLibraryName = (name) => `${EXTERNAL_PREFIX}${snakeCase(name)}`;

module.exports = getExternalLibraryName;
