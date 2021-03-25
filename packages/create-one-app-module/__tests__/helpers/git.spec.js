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

const { tryGitInit, isInGitRepository } = require('../../helpers/git');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Lines 37-57

describe('git', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isInGitRepository', () => {
    it('should return false', () => {
      execSync.mockImplementation(() => {
        throw new Error('Error');
      });

      expect(isInGitRepository()).toBe(false);
    });
    it('should return true', () => {
      execSync.mockImplementation(() => jest.fn());
      expect(isInGitRepository()).toBe(true);
    });
  });

  describe('tryGitInit', () => {
    it('succeeds if not in git repository', () => {
      execSync.mockImplementation((args) => {
        if (args === 'git rev-parse --is-inside-work-tree') {
          throw new Error('error');
        }
        return jest.fn();
      });
      const didInit = tryGitInit('../__testfixtures__/git_init');
      expect(didInit).toBe(true);
    });
    it('fails if in a git repository', () => {
      execSync.mockImplementation(jest.fn());
      const didInit = tryGitInit();
      expect(didInit).toBe(false);
    });
  });
});
