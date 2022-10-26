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

import { logErrors, logWarnings } from '../../../esbuild/utils/colorful-logging';

jest.spyOn(console, 'log');

// here we want to see chalk formatting
jest.mock('chalk', () => ({
  yellow: (str) => `<chalk.yellow>${str}</chalk.yellow>`,
  red: (str) => `<chalk.red>${str}</chalk.red>`,
}));

describe('logging helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logErrors', () => {
    it('should console log errors in red with a title', () => {
      logErrors(['mockMessage1', 'mockMessage2']);

      expect(console).toHaveLogs([
        '<chalk.red>Errors:</chalk.red>',
        '<chalk.red>    mockMessage1</chalk.red>',
        '<chalk.red>    mockMessage2</chalk.red>',
      ]);
    });

    it('should console log nothing if there are no messages', () => {
      logErrors([]);

      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });

  describe('logWarnings', () => {
    it('should console log warnings in orange with a title', () => {
      logWarnings(['mockMessage1', 'mockMessage2']);

      expect(console).toHaveLogs([
        '<chalk.yellow>Warnings:</chalk.yellow>',
        '<chalk.yellow>    mockMessage1</chalk.yellow>',
        '<chalk.yellow>    mockMessage2</chalk.yellow>',
      ]);
    });

    it('should console log nothing if there are no messages', () => {
      logWarnings([]);

      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
