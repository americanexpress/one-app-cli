import snakeCase from 'lodash.snakecase';

const EXTERNAL_PREFIX = '__holocron_external';

export const getExternalLibraryName = (name, version) => [
  EXTERNAL_PREFIX,
  snakeCase(name),
  version
    .replace(/[^\d.]+/g, '')
    .replace(/\.+/g, '_'),
].filter(Boolean).join('__');
