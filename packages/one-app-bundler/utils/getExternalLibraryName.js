const { snakeCase } = require('lodash');
const { EXTERNAL_PREFIX } = require('..');

/**
 * Creates a unique global variable name to store an external's code
 * @param {string} name External name
 * @param {string} version External semver version (e.g. 1.2.3)
 * @returns {string} global variable name
 */
const getExternalLibraryName = (name, version) => [EXTERNAL_PREFIX, snakeCase(name), version.replace(/[^\d.]+/g, '').replace(/\.+/g, '_')].filter(Boolean).join('__');

module.exports = getExternalLibraryName;
