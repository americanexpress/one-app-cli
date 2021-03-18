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

const path = require('path');
const isDirectoryEmpty = require('../../helpers/isDirectoryEmpty');

describe('isDirectoryEmpty', () => {
  it('should return directory is empty', () => {
    const root = path.resolve('./packages/create-one-app-module/__tests__/__testfixtures__/empty');
    const isDirEmpty = isDirectoryEmpty(root, 'empty');
    expect(isDirEmpty).toBe(true);
  });

  it('should return directory is not empty', () => {
    const root = path.resolve('./packages/create-one-app-module/__tests__/__testfixtures__/conflicted');
    const isDirEmpty = isDirectoryEmpty(root, 'conflicted');
    expect(isDirEmpty).toBe(false);
  });
});
