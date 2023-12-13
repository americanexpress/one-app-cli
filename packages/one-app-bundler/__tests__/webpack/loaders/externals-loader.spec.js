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

import unboundExternalsLoader from '../../../webpack/loaders/externals-loader.js';

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: () => ({
    packageJson: {
      // this is used for the first call for modules package.json
      dependencies: {
        'my-dependency': '^1.0.0',
      },
      // this is used on second call for the dependency package.json
      version: '1.2.3',
    },
  }),
}));

jest.mock('../../../utils/loadExternalsPackageJson.js', () => jest.fn((externalName) => ({
  name: externalName,
  version: '1.2.3-version-mock',
})));

describe('externals-loader', () => {
  let externalsLoader;
  let mockGetOptions;

  beforeEach(() => {
    mockGetOptions = jest.fn(() => ({
      externalName: 'my-dependency',
      bundleTarget: 'browser',
    }));
    externalsLoader = unboundExternalsLoader.bind({
      getOptions: mockGetOptions,
    });
  });

  describe('when bundleTarget is browser', () => {
    it('does not include content, gets the dependency from root module', async () => {
      expect.assertions(3);
      const content = 'This is some content!';
      const loadedExternalContent = await externalsLoader(content);
      expect(content).toMatch(/This is some content/);
      expect(loadedExternalContent).not.toMatch(/This is some content/);
      expect(loadedExternalContent).toMatchSnapshot();
    });

    it('uses global.Holocron', async () => {
      expect.assertions(1);
      const loadedExternalContent = await externalsLoader('This is some content!');
      expect(loadedExternalContent).toMatch(/global\.Holocron/);
    });
  });

  describe('when bundleTarget is server', () => {
    it('does not include content, gets the dependency from root module', async () => {
      expect.assertions(3);
      mockGetOptions.mockReturnValueOnce({
        externalName: 'my-dependency',
        bundleTarget: 'server',
      });
      const content = 'This is some content!';
      const loadedExternalContent = await externalsLoader(content);
      expect(content).toMatch(/This is some content/);
      expect(loadedExternalContent).not.toMatch(/This is some content/);
      expect(loadedExternalContent).toMatchSnapshot();
    });

    it('requires Holocron', async () => {
      expect.assertions(1);
      mockGetOptions.mockReturnValueOnce({
        externalName: 'my-dependency',
        bundleTarget: 'server',
      });
      const loadedExternalContent = await externalsLoader('This is some content!');
      expect(loadedExternalContent).toMatch(/require\("holocron"\)/);
    });
  });
});
