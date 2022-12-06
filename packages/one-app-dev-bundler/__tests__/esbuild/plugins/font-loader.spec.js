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

import fontLoader from '../../../esbuild/plugins/font-loader';
import { runSetupAndGetLifeHooks, runOnLoadHook } from './__plugin-testing-utils__.js';

describe('Esbuild image loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    expect(fontLoader.name).toBe('fontLoader');
  });

  describe('setup function', () => {
    it('should register an onLoad hook, with the right filters for all bundles', () => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(fontLoader);
      expect(lifeCycleHooks.onLoad.length).toBe(1);
      expect(lifeCycleHooks.onLoad[0].config).toEqual({ filter: /.ttf$|.woff$|.woff2$|.jfproj$/ });
    });
  });
});
describe('lifecycle Hooks', () => {
  it('should transform inputs to outputs for image browser, and server', async () => {
    const inputs = {
      mockFileName: 'testFont.png',
      mockFileContent: 'mockFontContent',
    };
    const outputs = {
      expectedLoader: 'js',
      expectedContent: 'module.exports = "data:font/png;base64,bW9ja0ZvbnRDb250ZW50"',
    };
    expect.assertions(2);
    const onLoadHook = runSetupAndGetLifeHooks(fontLoader).onLoad[0].hookFunction;

    const { contents, loader } = await runOnLoadHook(onLoadHook, inputs);

    expect(contents).toEqual(outputs.expectedContent);
    expect(loader).toEqual(outputs.expectedLoader);
  });
});
