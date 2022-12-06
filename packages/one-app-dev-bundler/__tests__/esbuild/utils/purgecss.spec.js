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

import glob from 'glob-all';
import mockFs from 'mock-fs';
import postcssPurgeCSS from '@fullhuman/postcss-purgecss';

import purgecss from '../../../esbuild/utils/purgecss';

jest.mock('glob-all');
jest.mock('@fullhuman/postcss-purgecss');

beforeEach(() => {
  postcssPurgeCSS.mockClear();
});

test('runs postcss purgecss with default config', () => {
  glob.sync.mockReturnValue(['Test.jsx']);

  mockFs(
    { 'Test.jsx': 'js content' }
  );

  purgecss();

  mockFs.restore();

  expect(postcssPurgeCSS).toHaveBeenCalledWith({
    content: [{
      extension: 'js',
      raw: 'js content',
    }],
  });
});

test('runs postcss purgecss with custom config', () => {
  glob.sync.mockReturnValue(['Test.jsx']);

  mockFs(
    { 'Test.jsx': 'js content' }
  );

  purgecss({
    safelist: ['random', 'yep', 'button', /^nav-/],
  });

  mockFs.restore();

  expect(postcssPurgeCSS).toHaveBeenCalledWith({
    content: [{
      extension: 'js',
      raw: 'js content',
    }],
    safelist: ['random', 'yep', 'button', /^nav-/],
  });
});
