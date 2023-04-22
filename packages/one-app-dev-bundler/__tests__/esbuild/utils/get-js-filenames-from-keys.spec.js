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

import { getJsFilenamesFromKeys } from '../../../esbuild/utils/get-js-filenames-from-keys';

describe('getJsFilenamesFromKeys', () => {
  it('should return any keys from the passed object that end in .js', () => {
    expect(getJsFilenamesFromKeys({
      'file/path/mock.html': 'val',
      'file/path/mock.map': 'val',
      'file/path/mock.js': 'val',
      'file/path/second/mock.js': 'val',
    })).toEqual([
      'file/path/mock.js',
      'file/path/second/mock.js',
    ]);
  });

  it('should return [] if there are no js file names', () => {
    expect(getJsFilenamesFromKeys({
      'file/path/mock.html': 'val',
      'file/path/mock.map': 'val',
    })).toEqual([]);
  });
});
