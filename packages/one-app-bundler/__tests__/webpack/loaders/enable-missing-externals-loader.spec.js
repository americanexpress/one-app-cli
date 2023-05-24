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
const enableMissingExternalsLoader = require('../../../webpack/loaders/enable-missing-externals-loader');

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({ enableMissingExternalFallbacks: true })),
}));

describe('enable-missing-externals-loader', () => {
  it('should append the enableMissingExternalFallbacks to the default export', () => {
    loaderUtils.getOptions.mockReturnValueOnce({ enableMissingExternalFallbacks: true });

    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;
    expect(enableMissingExternalsLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', () => {
    loaderUtils.getOptions.mockReturnValueOnce({ enableMissingExternalFallbacks: true });

    const content = `\
export default from './components/MyComponent';
`;
    expect(() => enableMissingExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', () => {
    loaderUtils.getOptions.mockReturnValueOnce({ enableMissingExternalFallbacks: true });

    const content = `\
module.exports = require('./components/MyComponent');
`;
    expect(() => enableMissingExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export default hoc()', () => {
    loaderUtils.getOptions.mockReturnValueOnce({ enableMissingExternalFallbacks: true });

    const content = `\
import SomeComponent from './SomeComponent';

export default hocChain(SomeComponent);
`;
    expect(() => enableMissingExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });
});
