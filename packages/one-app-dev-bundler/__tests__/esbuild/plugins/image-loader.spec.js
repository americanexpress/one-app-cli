/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import imageLoader from '../../../esbuild/plugins/image-loader.js';
import { runOnLoadHook, runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

describe('Esbuild image loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    expect(imageLoader.name).toBe('imageLoader');
  });

  describe('setup function', () => {
    it('should register an onLoad hook, with the right filters for all bundles', () => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(imageLoader);
      expect(lifeCycleHooks).toHaveProperty('onLoad.0.config.filter', expect.any(RegExp));
      expect(lifeCycleHooks.onLoad).toHaveLength(1);
    });

    it.each([
      ['/home/me/projects/modules/src/components/image.png'],
      ['/home/me/projects/modules/src/components/image.PNG'],
      ['/home/me/projects/modules/src/components/image.jpeg'],
      ['/home/me/projects/modules/src/components/image.JPEG'],
      ['/home/me/projects/modules/src/components/image.jpg'],
      ['/home/me/projects/modules/src/components/image.JPG'],
      ['/home/me/projects/modules/src/components/image.svg'],
      ['/home/me/projects/modules/src/components/image.SVG'],
    ])('should register an onLoad hook for a resource like %s', (filePath) => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(imageLoader);
      expect(lifeCycleHooks).toHaveProperty('onLoad.0.config.filter', expect.any(RegExp));
      expect(filePath).toMatch(lifeCycleHooks.onLoad[0].config.filter);
    });
  });
});
describe('lifecycle Hooks', () => {
  it('should transform inputs to outputs for image browser, and server', async () => {
    const inputs = {
      mockFileName: 'testImage.png',
      mockFileContent: 'mockImageContent',
    };
    /* eslint-disable no-useless-escape --  double quotes need to be escaped */
    const outputs = {
      expectedLoader: 'js',
      expectedContent: 'module.exports = \"data:image/png;base64,bW9ja0ltYWdlQ29udGVudA==\"',
    };
    /* eslint-enable no-useless-escape --  double quotes need to be escaped */
    expect.assertions(2);
    const onLoadHook = runSetupAndGetLifeHooks(imageLoader).onLoad[0].hookFunction;

    const { contents, loader } = await runOnLoadHook(onLoadHook, inputs);

    expect(contents).toEqual(outputs.expectedContent);
    expect(loader).toEqual(outputs.expectedLoader);
  });
  describe('Bundling svg', () => {
    it('should generate correct dataurl for server and browser bundles', async () => {
      const inputs = {
        mockFileName: 'testImage.svg',
        mockFileContent: 'mockImageContent',
      };
      const outputs = {
        expectedLoader: 'js',
        expectedContent: 'module.exports = "data:image/svg+xml;base64,bW9ja0ltYWdlQ29udGVudA=="',
      };
      expect.assertions(2);
      const onLoadHook = runSetupAndGetLifeHooks(imageLoader).onLoad[0].hookFunction;

      const { contents, loader } = await runOnLoadHook(onLoadHook, inputs);

      expect(contents).toEqual(outputs.expectedContent);
      expect(loader).toEqual(outputs.expectedLoader);
    });
  });
});
