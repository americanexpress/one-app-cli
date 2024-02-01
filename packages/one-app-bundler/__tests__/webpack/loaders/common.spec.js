/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */
const {
  babelLoader,
} = require('../../../webpack/loaders/common');

jest.mock('sass', () => () => 0);

jest.spyOn(process, 'cwd');

describe('Common webpack loaders', () => {
  beforeEach(() => {
    process.cwd.mockImplementation(() => '/mock/path/');
  });
  describe('babel-loader', () => {
    it('should return a config that extends the project\'s babelrc', () => {
      expect(babelLoader('modern')).toMatchSnapshot();
    });

    it('should return a config with the expected BABEL_ENV', () => {
      expect(babelLoader('legacy')).toMatchSnapshot();
    });
  });
});
