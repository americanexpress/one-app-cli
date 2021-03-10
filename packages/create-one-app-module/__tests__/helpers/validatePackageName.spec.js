/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

const validateProjectName = require('validate-npm-package-name');
const validateNpmName = require('../../helpers/validatePackageName');

jest.mock('validate-npm-package-name');

describe('validateNpmName', () => {
  it('returns true if validForNewPackages returns true', () => {
    validateProjectName.mockImplementation(() => ({
      validForNewPackages: true,
      validForOldPackages: true,
    }));

    const isNameValid = validateNpmName('create-one-app-module-test');
    expect(isNameValid.valid).toBe(true);
  });

  it('returns false if validForNewPackages returns false', () => {
    validateProjectName.mockImplementation(() => ({
      validForNewPackages: false,
      validForOldPackages: false,
    }));

    const isNameValid = validateNpmName('test-name');
    expect(isNameValid.valid).toBe(false);
  });

  it('includes any warnings return by the package', () => {
    validateProjectName.mockImplementation(() => ({
      validForNewPackages: false,
      validForOldPackages: true,
      warnings: [
        'name can no longer contain capital letters',
        'name can no longer contain more than 214 characters',
      ],
    }));

    const isNameValid = validateNpmName('test-name');
    expect(isNameValid.valid).toBe(false);
    expect(isNameValid.problems).toStrictEqual([
      'name can no longer contain capital letters',
      'name can no longer contain more than 214 characters',
    ]);
  });
});
