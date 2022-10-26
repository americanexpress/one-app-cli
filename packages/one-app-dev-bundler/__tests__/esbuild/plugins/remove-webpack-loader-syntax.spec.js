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

import removeWebpackLoaderSyntax from '../../../esbuild/plugins/remove-webpack-loader-syntax';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

describe('Esbuild plugin removeWebpackLoaderSyntax', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a plugin with the correct name', () => {
    expect(removeWebpackLoaderSyntax.name).toBe('removeWebpackLoaderSyntax');
  });

  describe('setup function', () => {
    it('should register an onLoad hook, with the right filters', () => {
      const lifeCycleHooks = runSetupAndGetLifeHooks(removeWebpackLoaderSyntax);

      expect(lifeCycleHooks.onResolve.length).toBe(1);
      expect(lifeCycleHooks.onResolve[0].config).toEqual({ filter: /^!.*/ });
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onResolve', () => {
      [
        { testName: 'with webpack syntax', inputPath: '!scss-loader!css-loader!style-loader!../../index.css', outputPath: '../../index.css' },
        { testName: 'without webpack syntax', inputPath: '../../index.css', outputPath: '../../index.css' },
      ].forEach(({ testName, inputPath, outputPath }) => {
        it(`should transform inputs to outputs for ${testName}`, async () => {
          const {
            hookFunction: onResolveHook,
          } = runSetupAndGetLifeHooks(removeWebpackLoaderSyntax).onResolve[0];

          const { path: resolvedPath } = onResolveHook({ path: inputPath, resolveDir: '' });

          expect(resolvedPath).toEqual(outputPath);
        });
      });
    });
  });
});
