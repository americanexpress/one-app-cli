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

import unboundProvidedExternalsLoader from '../../../webpack/loaders/provided-externals-loader.js';

jest.mock('loader-utils', () => ({
}));

jest.mock('../../../utils/loadExternalsPackageJson.js', () => jest.fn((externalName) => ({
  name: externalName,
  version: '1.2.3-version-mock',
})));

describe('provided-externals-loader', () => {
  let providedExternalsLoader;
  let mockGetOptions;
  beforeEach(() => {
    mockGetOptions = jest.fn(() => ({ providedExternals: ['ajv', 'lodash'] }));
    providedExternalsLoader = unboundProvidedExternalsLoader.bind({
      getOptions: mockGetOptions,

    });
  });
  it('should append the providedExternals to the default export', async () => {
    expect.assertions(1);
    mockGetOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });

    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;
    expect(await providedExternalsLoader(content)).toMatchSnapshot();
  });

  it('accepts an object', async () => {
    expect.assertions(1);
    mockGetOptions.mockReturnValueOnce({ providedExternals: { ajv: {}, lodash: {} } });

    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;
    expect(await providedExternalsLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', async () => {
    expect.assertions(1);
    mockGetOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });

    const content = `\
export default from './components/MyComponent';
`;
    await expect(
      async () => providedExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', async () => {
    expect.assertions(1);
    mockGetOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });

    const content = `\
module.exports = require('./components/MyComponent');
`;
    await expect(
      async () => providedExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export default hoc()', async () => {
    expect.assertions(1);
    mockGetOptions.mockReturnValueOnce({ providedExternals: ['ajv', 'lodash'] });

    const content = `\
import SomeComponent from './SomeComponent';

export default hocChain(SomeComponent);
`;
    await expect(
      async () => providedExternalsLoader(content)
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
