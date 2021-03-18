/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

const { execSync } = require('child_process');
const shouldUseYarn = require('../../helpers/useYarn');

jest.mock('child_process');

describe('shouldUseYarn', () => {
  it('it should return false to use yarn if "user-agent" starts with "npm"', () => {
    jest.mock('child_process', () => ({
      execSync: jest.fn(),
    }));
    process.env.npm_config_user_agent = 'npm/6.14.10 node/v12.20.1 darwin x64';
    const useYarn = shouldUseYarn();
    expect(useYarn).toBe(false);
  });
  it('should return true to use yarn if "user-agent" starts with "yarn"', () => {
    jest.mock('child_process', () => ({
      execSync: jest.fn(),
    }));
    process.env.npm_config_user_agent = 'yarn/1.22.10 npm/? node/v12.20.1 darwin x64';
    const useYarn = shouldUseYarn();
    expect(useYarn).toBe(true);
  });
  it('should execute execSync if no "user-agent" is set', () => {
    process.env.npm_config_user_agent = '';
    shouldUseYarn();

    expect(execSync).toHaveBeenCalledTimes(1);
  });
  it('should return false if execSync errors', () => {
    process.env.npm_config_user_agent = '';
    execSync.mockImplementation(() => {
      throw new Error('Error');
    });
    const useYarn = shouldUseYarn();
    expect(useYarn).toBe(false);
  });
});
