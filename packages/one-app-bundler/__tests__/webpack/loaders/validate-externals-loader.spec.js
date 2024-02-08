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

import readPkgUp from 'read-package-up';
import unboundValidateExternalsLoader from '../../../webpack/loaders/validate-required-externals-loader.js';

jest.mock('read-package-up', () => ({
  readPackageUpSync: jest.fn(),
}));

// eslint-disable-next-line global-require -- mocking readPkgUp needs us to require a json file
readPkgUp.readPackageUpSync.mockImplementation(() => ({ packageJson: require('../../../package.json') }));

describe('validate-required-externals-loader', () => {
  let validateExternalsLoader;

  beforeEach(() => {
    jest.clearAllMocks();
    validateExternalsLoader = unboundValidateExternalsLoader.bind({
      getOptions: jest.fn(() => ({ requiredExternals: ['ajv', 'lodash'] })),
    });
  });
  it('should add versions for legacy server side validation on appConfig', async () => {
    expect.assertions(1);
    const content = `\
import SomeComponent from './SomeComponent';

export default SomeComponent;
`;
    expect(await validateExternalsLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', async () => {
    expect.assertions(1);
    const content = `\
export default from './components/MyComponent';
`;
    await expect(
      async () => validateExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', async () => {
    expect.assertions(1);
    const content = `\
module.exports = require('./components/MyComponent');
`;
    await expect(
      async () => validateExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export default hoc()', async () => {
    expect.assertions(1);
    const content = `\
import SomeComponent from './SomeComponent';

export default hocChain(SomeComponent);
`;
    await expect(
      async () => validateExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
