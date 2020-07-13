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
  describe('basic child module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        moduleName: 'my-basic-child-module',
        moduleType: 'child module',
        setupInternationalization: 'No',
        setupParrotMiddleware: 'No',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyBasicChildModule.spec.jsx',
        '__tests__/.eslintrc.json',
        '__tests__/index.spec.js',
        'src/components/MyBasicChildModule.jsx',
        'src/index.js',
        '.babelrc',
        '.eslintrc.json',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('provides src/components/DefaultModule.jsx as default when no prompt is provided', () => helpers
      .run(path.join(__dirname, '../generators/app')).then(() => {
        assert.file(['src/components/DefaultModule.jsx']);
      }));
  });

  describe('basic root module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        moduleName: 'my-basic-root-module',
        moduleType: 'root module',
        setupInternationalization: 'No',
        setupParrotMiddleware: 'No',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyBasicRootModule.spec.jsx',
        '__tests__/appConfig.spec.js',
        '__tests__/index.spec.js',
        '__tests__/.eslintrc.json',
        'src/components/MyBasicRootModule.jsx',
        'src/index.js',
        'src/csp.js',
        'src/childRoutes.jsx',
        'src/appConfig.js',
        '.babelrc',
        '.eslintrc.json',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('installs csp dependencies', () => {
      assert.jsonFileContent('package.json', {
        dependencies: {
          'content-security-policy-builder': '^2.1.0',
        },
      });
    });
  });

  describe('intl child module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        moduleName: 'my-intl-child-module',
        moduleType: 'child module',
        setupInternationalization: 'Yes',
        setupParrotMiddleware: 'No',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyIntlChildModule.spec.jsx',
        '__tests__/.eslintrc.json',
        '__tests__/index.spec.js',
        '__tests__/locale.spec.js',
        'locale/en-CA.json',
        'locale/en-US.json',
        'locale/es-MX.json',
        'src/components/MyIntlChildModule.jsx',
        'src/index.js',
        'test-setup.js',
        '.babelrc',
        '.eslintrc.json',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('installs intl dependencies and test scripts', () => {
      assert.jsonFileContent('package.json', {
        dependencies: {
          '@americanexpress/one-app-ducks': '^4.0.0',
          immutable: '^3.8.2',
          'prop-types': '^15.5.9',
          'react-intl': '^4.5.3',
          'react-redux': '^7.1.3',
          redux: '^4.0.4',
        },
        devDependencies: {
          glob: '^7.1.6',
          '@babel/polyfill': '^7.8.3',
        },
        jest: {
          setupFilesAfterEnv: './test-setup.js',
        },
      });
    });
    it('adds react-intl as an external', () => {
      assert.jsonFileContent('package.json', {
        'one-amex': {
          bundler: {
            externals: 'react-intl',
          },
        },
      });
    });
  });

  describe('intl root module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        moduleName: 'my-intl-root-module',
        moduleType: 'root module',
        setupInternationalization: 'Yes',
        setupParrotMiddleware: 'No',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyIntlRootModule.spec.jsx',
        '__tests__/appConfig.spec.js',
        '__tests__/.eslintrc.json',
        '__tests__/index.spec.js',
        '__tests__/locale.spec.js',
        'locale/en-CA.json',
        'locale/en-US.json',
        'locale/es-MX.json',
        'src/components/MyIntlRootModule.jsx',
        'src/index.js',
        'src/csp.js',
        'src/childRoutes.jsx',
        'src/appConfig.js',
        'test-setup.js',
        '.babelrc',
        '.eslintrc.json',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('installs intl dependencies and test scripts', () => {
      assert.jsonFileContent('package.json', {
        dependencies: {
          '@americanexpress/one-app-ducks': '^4.0.0',
          immutable: '^3.8.2',
          'prop-types': '^15.5.9',
          'react-intl': '^4.5.3',
          'react-redux': '^7.1.3',
          redux: '^4.0.4',
        },
        devDependencies: {
          glob: '^7.1.6',
          '@babel/polyfill': '^7.8.3',
        },
        jest: {
          setupFilesAfterEnv: './test-setup.js',
        },
      });
    });
    it('provides react-intl as an external for child modules', () => {
      assert.jsonFileContent('package.json', {
        'one-amex': {
          bundler: {
            providesExternals: 'react-intl',
          },
        },
      });
    });
  });

  describe('intl child with parrot module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        moduleName: 'my-intl-child-parrot-module',
        moduleType: 'child module',
        setupInternationalization: 'Yes',
        setupParrotMiddleware: 'Yes',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyIntlChildParrotModule.spec.jsx',
        '__tests__/.eslintrc.json',
        '__tests__/index.spec.js',
        '__tests__/locale.spec.js',
        'mock/scenarios.js',
        'locale/en-CA.json',
        'locale/en-US.json',
        'locale/es-MX.json',
        'src/components/MyIntlChildParrotModule.jsx',
        'src/index.js',
        'test-setup.js',
        '.babelrc',
        '.eslintrc.json',
        'dev.middleware.js',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('adds parrot-middleware dependency and runner script', () => {
      assert.jsonFileContent('package.json', {
        'one-amex': {
          runner: {
            parrotMiddleware: './dev.middleware.js',
          },
        },
        devDependencies: {
          'parrot-middleware': '^4.1.1',
        },
      });
    });
  });
  describe('child with setupInternationalizationByDefault option module creation', () => {
    beforeAll(() => helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({
        setupInternationalizationByDefault: 'my-intl-by-default-child',
      })
      .withPrompts({
        moduleName: 'my-intl-by-default-child',
        moduleType: 'child module',
        setupParrotMiddleware: 'Yes',
      })
      .toPromise()
    );
    it('creates files', () => {
      assert.file([
        '__tests__/components/MyIntlByDefaultChild.spec.jsx',
        '__tests__/.eslintrc.json',
        '__tests__/index.spec.js',
        '__tests__/locale.spec.js',
        'mock/scenarios.js',
        'locale/en-CA.json',
        'locale/en-US.json',
        'locale/es-MX.json',
        'src/components/MyIntlByDefaultChild.jsx',
        'src/index.js',
        'test-setup.js',
        '.babelrc',
        '.eslintrc.json',
        'dev.middleware.js',
        '.gitignore',
        'package.json',
        'README.md',
      ]);
    });
    it('adds parrot-middleware dependency and runner script', () => {
      assert.jsonFileContent('package.json', {
        'one-amex': {
          runner: {
            parrotMiddleware: './dev.middleware.js',
          },
        },
        devDependencies: {
          'parrot-middleware': '^4.1.1',
        },
      });
    });
  });
});
