/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-one-app-module', () => {
  describe('module creation', () => {
    describe('providing module name when prompted', () => {
      beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({ moduleName: 'my-module' })
        .toPromise()
      );

      it('creates files', () => {
        assert.file([
          'src/components/MyModule.jsx',
          'src/index.js',
          'src/config.js',
          'src/csp.js',
          '.babelrc',
          '.eslintrc.json',
          '.gitignore',
          'package.json',
          'README.md',
        ]);
      });
    });

    describe('creating src/components file', () => {
      it('creates src/components/<ModuleName>.jsx file', () => helpers
        .run(path.join(__dirname, '../generators/app'))
        .withPrompts({ moduleName: 'my-special-module' })
        .then(() => {
          assert.file(['src/components/MySpecialModule.jsx']);
        }));
      it('provides src/components/DefaultModule.jsx as default when no prompt is provided', () => helpers
        .run(path.join(__dirname, '../generators/app')).then(() => {
          assert.file(['src/components/DefaultModule.jsx']);
        }));
    });
  });
});
