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

import fs from 'fs';
import path from 'path';

import analyzeBundles from '../../utils/analyze-bundles.js';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('chalk', () => {
  const chalk = jest.requireActual('chalk');

  return new chalk.Instance({ level: 0 });
});

jest.spyOn(console, 'log');

afterAll(() => {
  jest.clearAllMocks();
});

describe('analyze-bundles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports the analysis comparting webpack vs esbuild', async () => {
    fs.promises.readFile.mockImplementation((absolutePath) => {
      const fileName = absolutePath.split(path.sep).reverse()[0];

      switch (fileName) {
        case '.webpack-stats.browser.json': {
          return JSON.stringify({
            assets: [{
              size: 2000,
            }],
            time: 10000,
          });
        }
        case '.webpack-stats.node.json': {
          return JSON.stringify({
            assets: [{
              size: 2000,
            }],
            time: 4000,
          });
        }
        case '.esbuild-stats.browser.json': {
          return JSON.stringify({
            'file.js': {
              bytes: 1000,
            },
            durationMs: 3000,
          });
        }
        case '.esbuild-stats.node.json': {
          return JSON.stringify({
            'file.js': {
              bytes: 3000,
            },
            durationMs: 12000,
          });
        }
        default: {
          return null;
        }
      }
    });

    await analyzeBundles();

    expect(fs.promises.readFile).toHaveBeenCalledTimes(4);

    expect(console).toHaveLogs([
      'NOTE: Bundle Analysis requires stats from Webpack and ESBuild. Please build your module with the One App Bundler as well with the Experimental One App Bundler first to generate the required stats (in production mode).',
      '   BUNDLE ANALYSIS   ',
      '\n',
      'BROWSER',
      ['Webpack Size', '2 kB', '-', 'Took', '10s'],
      ['Esbuild Size', '1 kB', '-', 'Took', '3s'],
      '',
      'Esbuild is 50% smaller',
      'Esbuild is 70% faster',
      '\n',
      'NODE',
      ['Webpack Size', '2 kB', '-', 'Took', '4s'],
      ['Esbuild Size', '3 kB', '-', 'Took', '12s'],
      '',
      'Webpack is 33% smaller',
      'Webpack is 67% faster',
      '\n',
      'Report saved in .bundler-report.json',
      'Please share the report in #experimental-bundler-beta slack channel, this will help us to roll it out to production sooner!',
    ]);
  });

  it('throws an error instead of reporting due to file not being found', async () => {
    fs.promises.readFile.mockImplementation(() => {
      const error = new Error('File not found');

      error.code = 'ENOENT';

      throw error;
    });

    await analyzeBundles();

    expect(console).toHaveLogs([
      'NOTE: Bundle Analysis requires stats from Webpack and ESBuild. Please build your module with the One App Bundler as well with the Experimental One App Bundler first to generate the required stats (in production mode).',
      '   BUNDLE ANALYSIS   ',
      '\n',
      'BROWSER',
      'File ".webpack-stats.browser.json" not found. This file is required in order to properly collect bundle data for analysis.',
      'NODE',
      'File ".webpack-stats.node.json" not found. This file is required in order to properly collect bundle data for analysis.',
      'Report saved in .bundler-report.json',
      'Please share the report in #experimental-bundler-beta slack channel, this will help us to roll it out to production sooner!',
    ]);
  });

  it('throws an error instead of reporting when something goes wrong reading a stat file', async () => {
    fs.promises.readFile.mockImplementation(() => {
      const error = new Error('Something went wrong');

      throw error;
    });

    await analyzeBundles();

    expect(console).toHaveLogs([
      'NOTE: Bundle Analysis requires stats from Webpack and ESBuild. Please build your module with the One App Bundler as well with the Experimental One App Bundler first to generate the required stats (in production mode).',
      '   BUNDLE ANALYSIS   ',
      '\n',
      'BROWSER',
      'Something went wrong',
      'NODE',
      'Something went wrong',
      'Report saved in .bundler-report.json',
      'Please share the report in #experimental-bundler-beta slack channel, this will help us to roll it out to production sooner!',
    ]);
  });

  it('prevents saving the report into a json file due to an error', async () => {
    fs.promises.readFile.mockImplementation((absolutePath) => {
      const fileName = absolutePath.split(path.sep).reverse()[0];

      if (fileName.includes('webpack')) {
        return JSON.stringify({
          assets: [{
            size: 2000,
          }],
          time: 10000,
        });
      }
      return JSON.stringify({
        'file.js': {
          bytes: 1000,
        },
        durationMs: 3000,
      });
    });
    fs.promises.writeFile.mockImplementation(() => {
      throw new Error('Testing');
    });

    await analyzeBundles();

    expect(console).toHaveLogs([
      'NOTE: Bundle Analysis requires stats from Webpack and ESBuild. Please build your module with the One App Bundler as well with the Experimental One App Bundler first to generate the required stats (in production mode).',
      '   BUNDLE ANALYSIS   ',
      '\n',
      'BROWSER',
      ['Webpack Size', '2 kB', '-', 'Took', '10s'],
      ['Esbuild Size', '1 kB', '-', 'Took', '3s'],
      '',
      'Esbuild is 50% smaller',
      'Esbuild is 70% faster',
      '\n',
      'NODE',
      ['Webpack Size', '2 kB', '-', 'Took', '10s'],
      ['Esbuild Size', '1 kB', '-', 'Took', '3s'],
      '',
      'Esbuild is 50% smaller',
      'Esbuild is 70% faster',
      '\n',
      'There was an error trying to save the report into .bundler-report.json',
    ]);
  });
});
