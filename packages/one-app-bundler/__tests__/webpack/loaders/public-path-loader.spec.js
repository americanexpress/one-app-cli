/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
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
import unboundPublicPathLoader from '../../../webpack/loaders/public-path-loader.js';

describe('validate-required-externals-loader', () => {
  let publicPathLoader;
  let mockGetOptions;

  beforeEach(() => {
    mockGetOptions = jest.fn(() => ({
      externalPublicPath: 'exampleValue[\'module-name-root\'].baseUrl',
    }));
    publicPathLoader = unboundPublicPathLoader.bind({
      getOptions: mockGetOptions,
    });
  });

  it('should prefix the file content with an assignment to the webpack public path variable', () => {
    const content = `\
import SomeComponent from './SomeComponent';

export default SomeComponent;
`;
    expect(publicPathLoader(content)).toMatchSnapshot();
    expect(publicPathLoader('')).toMatchSnapshot();
  });
});
