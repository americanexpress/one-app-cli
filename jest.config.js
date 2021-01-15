module.exports = {
  preset: 'amex-jest-preset',
  collectCoverageFrom: [
    'packages/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/build/**',
    '!packages/*/lib/**',
    '!packages/*/bin/**',
    '!packages/*/test-utils.js',
    '!packages/*/test-results/**',
    '!packages/generator-one-app-module/generators/app/templates/**',
  ],
  coverageThreshold: {
    global: {
      statements: 99.31,
      branches: 99.15,
      lines: 99.71,
      functions: 97,
    },
  },
  testPathIgnorePatterns: [
    'packages/generator-one-app-module/generators/app/templates',
  ],
};
