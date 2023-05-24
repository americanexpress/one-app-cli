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

const loaderUtils = require('loader-utils');
const externalsLoader = require('../../../webpack/loaders/externals-loader');

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({ externalName: 'lodash' })),
}));

jest.mock('read-pkg-up', () => ({
  sync: () => ({
    packageJson: {
      dependencies: {
        lodash: '^1.0.0',
      },
    },
  }),
}));

jest.mock('@babel/core', () => (({
  transformSync: () => ({
    code: `This is CJS code`
  })
})));

describe('externals-loader', () => {
  it('should ignore the content and get the dependency from the root module', () => {
    expect(externalsLoader.bind({
      resourcePath: 'test.js',
      context: 'test.js',
    })('This is some content!')).toMatchSnapshot();
  });

  it('does not use fallback for server', () => {
    loaderUtils.getOptions.mockReturnValueOnce({ externalName: 'lodash', bundleTarget: 'server' });

    expect(externalsLoader.bind({
      resourcePath: 'test.js',
      context: 'test.js',
    })('This is some content!')).toMatchSnapshot();
  });
});
