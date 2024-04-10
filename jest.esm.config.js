/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

module.exports = {
  preset: 'amex-jest-preset',
  verbose: true,
  testMatch: ['**/__tests__/**/*.spec.{js,jsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.esm.setup.js'],
  transform: {
    '^.+\\.m?jsx?$': 'babel-jest',
  },
  collectCoverageFrom: [
    'packages/**/*.{mjs,js,jsx}',
    '!**/__test_fixtures__/**',
    '!**/__fixtures__/**',
    '!**/node_modules/**',
    '!**/build/**',
    '!packages/*/bin/**',
    '!packages/*/test-utils.js',
    '!packages/*/test-results/**',
    '!packages/*/jest.esm.setup.js',
    // Despite it not being in the root, coverage reports see this package
    '!packages/one-app-locale-bundler/**',
    '!packages/one-app-dev-bundler/index.js',
  ],
  roots: [
    'packages/one-app-dev-bundler',
    'packages/one-app-bundler',
  ],
};
