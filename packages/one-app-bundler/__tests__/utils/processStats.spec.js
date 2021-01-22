/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

const processStats = require('../../utils/processStats');
const generateIntegrityManifest = require('../../utils/generateIntegrityManifest');

jest.mock('fs');
jest.mock('../../utils/generateIntegrityManifest');

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('processStats', () => {
  const hasErrors = jest.fn(() => false);
  const hasWarnings = jest.fn(() => false);
  const stats = {
    hasErrors,
    hasWarnings,
    toJson: jest.fn(() => ({
      errors: [new Error('error')],
      warnings: ['not configured optimally.', 'bundle too big.'],
    })),
    compilation: {
      errors: [],
      outputOptions: {
        filename: 'module.js',
      },
      compiler: {
        outputPath: '/',
      },
    },
  };

  it('should not throw and process the stats', () => {
    expect(() => processStats(stats)).not.toThrow();
    expect(generateIntegrityManifest).toHaveBeenCalledTimes(1);
  });

  it('should exit the process when there are webpack stats errors', () => {
    hasErrors.mockImplementationOnce(() => true);
    expect(() => processStats(stats)).not.toThrow();
    expect(hasErrors).toHaveBeenCalledTimes(1);
    expect(hasWarnings).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should log any warnings from the compilation', () => {
    hasWarnings.mockImplementationOnce(() => true);
    expect(() => processStats(stats)).not.toThrow();
    expect(hasErrors).toHaveBeenCalledTimes(1);
    expect(hasWarnings).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('should not throw if compilation errors exist while in watch mode', () => {
    const error = new Error('failed to build');
    expect(() => processStats({
      ...stats,
      compilation: {
        ...stats.compilation,
        errors: [error],
      },
    })).toThrow();
  });

  it('should throw when a compilation error is found', () => {
    const error = new Error('failed to build');
    expect(() => processStats({
      ...stats,
      compilation: {
        ...stats.compilation,
        errors: [error],
      },
    }, true)).not.toThrow();
  });
});
