/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
*/
module.exports = {
  preset: 'amex-jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.cjs.setup.js'],
  collectCoverageFrom: [
    'packages/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/build/**',
    'packages/*/lib/**',
    '!packages/*/bin/**',
    '!packages/*/test-utils.js',
    '!packages/*/test-results/**',
    '!**/__fixtures__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 99.72,
      branches: 99.8,
      functions: 99.15,
      lines: 99.9,
    },
  },
  roots: [
    'packages/eslint-plugin-one-app',
    'packages/one-app-locale-bundler',
    'packages/one-app-server-bundler',
    'packages/one-app-runner',
  ],
};
