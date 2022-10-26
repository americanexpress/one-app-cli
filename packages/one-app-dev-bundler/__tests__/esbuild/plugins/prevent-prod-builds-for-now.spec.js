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

import preventProdBuildsForNow from '../../../esbuild/plugins/prevent-prod-builds-for-now';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';

jest.spyOn(console, 'error');
jest.spyOn(process, 'exit');

describe('Esbuild plugin preventProdBuildsForNow', () => {
  let prevNodeEnv = null;
  beforeEach(() => {
    jest.clearAllMocks();
    prevNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    prevNodeEnv = null;
  });

  it('should be a plugin with the correct name', () => {
    expect(preventProdBuildsForNow.name).toBe('preventProdBuildsForNow');
  });

  describe('setup function', () => {
    it('should not log or exit in development mode', () => {
      process.env.NODE_ENV = 'development';
      runSetupAndGetLifeHooks(preventProdBuildsForNow);

      expect(console.error).toHaveBeenCalledTimes(0);
      expect(process.exit).toHaveBeenCalledTimes(0);
    });

    it('should log and exit in production mode', () => {
      process.env.NODE_ENV = 'production';
      process.exit.mockImplementationOnce(() => {});
      runSetupAndGetLifeHooks(preventProdBuildsForNow);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(`
  _____ _______ ____  _____  
 / ____|__   __/ __ \\|  __ \\ 
| (___    | | | |  | | |__) |
 \\___ \\   | | | |  | |  ___/ 
 ____) |  | | | |__| | |     
|_____/   |_|  \\____/|_|     

This bundler is only enabled for local development. If you see this message please raise an issue`);
      expect(process.exit).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(2);
    });
  });
});
