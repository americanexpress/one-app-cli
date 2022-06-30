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

const chalk = require('chalk');
const helper = require('../generators/app/promptValidations');

describe('testing prompt helpers', () => {
  it('should return false with an empty string', () => {
    expect(helper.validateIfInputIsValidOrNot('')).toEqual(chalk.red('Can\'t be an empty string.'));
  });
  it('should return false when a user just enters empty spaces', () => {
    expect(helper.validateIfInputIsValidOrNot('    ')).toEqual(chalk.red('Can\'t be an empty string.'));
  });
  it('should return true when a name is entered', () => {
    expect(helper.validateIfInputIsValidOrNot('CF Frost')).toEqual(true);
  });
});
