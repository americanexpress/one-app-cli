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
  getOptions: jest.fn(() => ({
    externalName: 'my-dependency',
    bundleTarget: 'browser',
  })),
}));

jest.mock('read-pkg-up', () => ({
  sync: () => ({
    packageJson: {
      dependencies: {
        'my-dependency': '^1.0.0',
      },
    },
  }),
}));

// mock for the fake external dependency package.json
jest.mock('my-dependency/package.json', () => ({
  version: '1.2.3',
}), { virtual: true });

describe('externals-loader', () => {
  describe('when bundleTarget is browser', () => {
    it('does not include content, gets the dependency from root module', () => {
      const content = 'This is some content!';
      const loadedExternalContent = externalsLoader(content);
      expect(content).toMatch(/This is some content/);
      expect(loadedExternalContent).not.toMatch(/This is some content/);
      expect(loadedExternalContent).toMatchSnapshot();
    });

    it('uses global.Holocron', () => {
      const loadedExternalContent = externalsLoader('This is some content!');
      expect(loadedExternalContent).toMatch(/global\.Holocron/);
    });
  });

  describe('when bundleTarget is server', () => {
    it('does not include content, gets the dependency from root module', () => {
      loaderUtils.getOptions.mockReturnValueOnce({
        externalName: 'my-dependency',
        bundleTarget: 'server',
      });
      const content = 'This is some content!';
      const loadedExternalContent = externalsLoader(content);
      expect(content).toMatch(/This is some content/);
      expect(loadedExternalContent).not.toMatch(/This is some content/);
      expect(loadedExternalContent).toMatchSnapshot();
    });

    it('requires Holocron', () => {
      loaderUtils.getOptions.mockReturnValueOnce({
        externalName: 'my-dependency',
        bundleTarget: 'server',
      });
      const loadedExternalContent = externalsLoader('This is some content!');
      expect(loadedExternalContent).toMatch(/require\("holocron"\)/);
    });
  });
});
