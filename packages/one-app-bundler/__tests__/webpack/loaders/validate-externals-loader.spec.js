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

const readPkgUp = require('read-pkg-up');
const validateExternalsLoader = require('../../../webpack/loaders/validate-required-externals-loader');

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({ requiredExternals: ['ajv', 'lodash'] })),
}));

jest.mock('read-pkg-up', () => ({
  sync: jest.fn(),
}));

readPkgUp.sync.mockImplementation(() => ({ packageJson: require('../../../package.json') }));

describe('validate-required-externals-loader', () => {
  it('should add versions for server side validation ', () => {
    const content = `\
import SomeComponent from './SomeComponent';

export default SomeComponent;
`;
    expect(validateExternalsLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', () => {
    const content = `\
export default from './components/MyComponent';
`;
    expect(() => validateExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', () => {
    const content = `\
module.exports = require('./components/MyComponent');
`;
    expect(() => validateExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export default hoc()', () => {
    const content = `\
import SomeComponent from './SomeComponent';

export default hocChain(SomeComponent);
`;
    expect(() => validateExternalsLoader(content)).toThrowErrorMatchingSnapshot();
  });
});
