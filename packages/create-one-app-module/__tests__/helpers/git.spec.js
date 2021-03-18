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

jest.mock('child_process');

// Lines 37-57

describe('git', () => {
  describe('tryGitInit', () => {
    it('should call execSync', () => {
      jest.mock('child_process', () => ({
        execSync: jest.fn(),
      }));
      tryGitInit('test-module');
      expect(execSync).toHaveBeenCalled();
    });
  });

  describe('isInGitRepository', () => {
    it('should return false', () => {
      execSync.mockImplementation(() => {
        throw new Error('Error');
      });
      isInGitRepository();
      expect(execSync).toHaveBeenCalled();
      expect(isInGitRepository()).toBe(false);
    });
  });
});
