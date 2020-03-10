require('amex-jest-preset-react/jest-setup');
require('@babel/polyfill');
const { matchersWithOptions } = require('jest-json-schema');

// eslint-disable-next-line no-undef
expect.extend(matchersWithOptions({
  extendRefs: true,
  formats: {
    bcp47: /^[a-z]{2}-[A-Z]{2}$/,
  },
}));
