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

import unboundEnableUnlistedExternalFallbacksLoader
  from '../../../webpack/loaders/enable-unlisted-external-fallbacks-loader.js';

describe('enable-unlisted-external-fallbacks-loader', () => {
  let enableUnlistedExternalFallbacksLoader;
  let getOptionsMock;

  beforeEach(() => {
    getOptionsMock = jest.fn(() => ({ enableUnlistedExternalFallbacks: true }));
    enableUnlistedExternalFallbacksLoader = unboundEnableUnlistedExternalFallbacksLoader.bind({
      getOptions: getOptionsMock,
    });
  });

  it('should append the enableUnlistedExternalFallbacks to the default export', () => {
    getOptionsMock.mockReturnValueOnce({ enableUnlistedExternalFallbacks: true });

    const content = `\
import MyComponent from './components/MyComponent';
export default MyComponent;
`;
    expect(enableUnlistedExternalFallbacksLoader(content)).toMatchSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export from', () => {
    getOptionsMock.mockReturnValueOnce({ enableUnlistedExternalFallbacks: true });

    const content = `\
export default from './components/MyComponent';
`;
    expect(() => enableUnlistedExternalFallbacksLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - module.exports', () => {
    getOptionsMock.mockReturnValueOnce({ enableUnlistedExternalFallbacks: true });

    const content = `\
module.exports = require('./components/MyComponent');
`;
    expect(() => enableUnlistedExternalFallbacksLoader(content)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when the wrong syntax is used - export default hoc()', () => {
    getOptionsMock.mockReturnValueOnce({ enableUnlistedExternalFallbacks: true });

    const content = `\
import SomeComponent from './SomeComponent';

export default hocChain(SomeComponent);
`;
    expect(() => enableUnlistedExternalFallbacksLoader(content)).toThrowErrorMatchingSnapshot();
  });
});
