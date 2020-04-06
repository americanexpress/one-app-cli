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

const providedExternalsLoader = require('../../../webpack/loaders/provided-externals-loader');

jest.mock('loader-utils', () => ({ getOptions: jest.fn(() => ({ providedExternals: {} })) }));


describe('provided-externals-loader', () => {
  let readOptions;
  beforeEach(() => {
    readOptions = require('loader-utils');
  });

  it('should append the providedExternals to the default export', () => {
    readOptions.getOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });
    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;

    expect(providedExternalsLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', () => {
    readOptions.getOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });
    const content = `\
export default from './components/MyComponent';
`;
    expect(() => providedExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', () => {
    readOptions.getOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });
    const content = `\
module.exports = require('./components/MyComponent');
`;
    expect(() => providedExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the dependency is not of type string', () => {
    readOptions.getOptions.mockReturnValueOnce({ providedExternals: [['ajv'], ['lodash']] });
    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;
    expect(() => providedExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });
});
