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

// yeoman private methods use underscores
/* eslint-disable no-underscore-dangle */
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const _ = require('lodash');
const helper = require('./promptValidations');
const packagejs = require('../../package.json');

const isNegativeAnswer = (answer) => (answer === false)
    || (
      typeof answer === 'string'
      && answer.trim().charAt(0).toLowerCase() === 'n'
    );

module.exports = class extends Generator {
  printOneAppLogo() {
    this.log('\n');
    this.log(`${chalk.hex('#00175a')('     ██████╗ ███╗   ██╗███████╗   ')}${chalk.hex('#fdb92d')('  █████╗ ██████╗ ██████╗ ')}`);
    this.log(`${chalk.hex('#00175a')('    ██╔═══██╗████╗  ██║██╔════╝  ')}${chalk.hex('#fdb92d')('  ██╔══██╗██╔══██╗██╔══██╗')}`);
    this.log(`${chalk.hex('#00175a')('    ██║   ██║██╔██╗ ██║█████╗   ')}${chalk.hex('#fdb92d')('   ███████║██████╔╝██████╔╝')}`);
    this.log(`${chalk.hex('#00175a')('    ██║   ██║██║╚██╗██║██╔══╝   ')}${chalk.hex('#fdb92d')('   ██╔══██║██╔═══╝ ██╔═══╝ ')}`);
    this.log(`${chalk.hex('#00175a')('    ╚██████╔╝██║ ╚████║███████╗  ')}${chalk.hex('#fdb92d')('  ██║  ██║██║     ██║     ')}`);
    this.log(`${chalk.hex('#00175a')('     ╚═════╝ ╚═╝  ╚═══╝╚══════╝  ')}${chalk.hex('#fdb92d')('  ╚═╝  ╚═╝╚═╝     ╚═╝     ')}\n`);
    this.log(chalk.hex('#10C900').bold('                https://github.com/americanexpress/one-app\n'));
    this.log(chalk.hex('#10C900')('Welcome to One App Generator ') + chalk.hex('#10C900')(`v${packagejs.version}`));
    this.log(chalk.hex('#10C900')(`Application files will be generated in folder: ${chalk.hex('#10C900').bold(process.env.PWD)}`));
    this.log(
      chalk.hex('#00175a')(
        '_______________________________________________________________________________________________________________\n'
      )
    );
    this.log(
      chalk.hex('#10C900')(`Documentation for One App is at ${chalk.hex('#10C900').underline('https://github.com/americanexpress/one-app')}`)
    );
    this.log(
      chalk.hex('#00175a')(
        '_______________________________________________________________________________________________________________\n'
      )
    );
  }

  _setUpModuleName(moduleName) {
    this.modulePackageName = _.kebabCase(moduleName);
    this.moduleNamePascal = _.upperFirst(_.camelCase(moduleName));

    this.destinationRoot(this.modulePackageName);
  }

  initializing() {
    this.printOneAppLogo();
  }

  prompting() {
    const prompts = [{
      type: 'input',
      name: 'moduleName',
      validate: helper.validateIfInputIsValidOrNot,
      message: 'Name of your Module:',
      store: false,
    },
    {
      type: 'list',
      name: 'setupInternationalization',
      default: 'Yes',
      message:
        'Set up with internationalization?',
      choices: ['Yes', 'No'],
      store: false,
    },
    {
      type: 'list',
      name: 'setupParrotMiddleware',
      default: 'Yes',
      message:
        'Generate with Parrot Middleware?',
      choices: ['Yes', 'No'],
      store: false,
    },
    ];

    return this.prompt(prompts)
      .then((answers) => {
        if (answers.moduleName) {
          this._setUpModuleName(answers.moduleName);
        } else {
          this._setUpModuleName('default-module');
        }
        this.setupInternationalization = answers.setupInternationalization;
        this.setupParrotMiddleware = !isNegativeAnswer(
          answers.setupParrotMiddleware
        );
      });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('./base-module'),
      this.destinationPath(),
      {
        modulePackageName: this.modulePackageName,
        moduleNamePascal: this.moduleNamePascal,
      },
      null,
      { globOptions: { dot: true } }
    );

    if (this.setupInternationalization) {
      this.fs.delete(this.destinationPath('src/components/ModuleContainer.jsx'));
      this.fs.delete(this.destinationPath('__tests__'));
      this.fs.copyTpl(
        this.templatePath('./intl-module'),
        this.destinationPath(),
        {
          modulePackageName: this.modulePackageName,
          moduleNamePascal: this.moduleNamePascal,
        },
        null,
        { globOptions: { dot: true } }
      );
      this.fs.extendJSON(this.destinationPath('package.json'), {
        dependencies: {
          '@americanexpress/one-app-ducks': '^4.0.0',
          immutable: '^3.8.2',
          'prop-types': '^15.5.9',
          'react-intl': '^3.6.0',
          'react-redux': '^7.1.3',
          redux: '^4.0.4',
        },
        devDependencies: {
          glob: '^7.1.6',
        },
      });
    }

    if (this.setupParrotMiddleware) {
      this.fs.extendJSON(this.destinationPath('package.json'), {
        'one-amex': {
          runner: {
            parrotMiddleware: './dev.middleware.js',
          },
        },
        devDependencies: {
          'parrot-middleware': '^3.1.0',
        },
      });
    } else {
      this.fs.delete(this.destinationPath('dev.middleware.js'));
      this.fs.delete(this.destinationPath('mock'));
    }


    this.fs.move(
      this.destinationPath('src/components/ModuleContainer.jsx'),
      this.destinationPath(`src/components/${this.moduleNamePascal}.jsx`)
    );
    // publishing to npm renames .gitignore to .npmignore
    this.fs.move(
      this.destinationPath('gitignore'),
      this.destinationPath('.gitignore')
    );
  }

  install() {
    this.npmInstall();
  }
};
