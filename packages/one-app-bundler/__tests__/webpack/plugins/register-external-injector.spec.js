/**
 * @jest-environment node
 */

/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const fs = require('node:fs');
const path = require('node:path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const { ExternalRegisterPlugin } = require('../../../webpack/plugins/register-external-injector');

const fixturesPath = path.join(__dirname, '__fixtures__');
const buildPath = path.join(fixturesPath, 'build');

const webpackOptions = {
  entry: path.join(fixturesPath, 'index.js'),
  devtool: 'source-map',
  output: {
    path: buildPath,
  },
  plugins: [new ExternalRegisterPlugin('external-a', '1.2.3')],
};

function waitForWebpack(options) {
  // eslint-disable-next-line no-promise-executor-return -- webpack callback
  return new Promise((resolve, reject) => webpack(options, (error, stats) => {
    if (error) { return reject(error); }
    if (stats.hasErrors()) { return reject(stats.toJson().errors); }
    return resolve(stats);
  }));
}

describe('ExternalRegisterPlugin', () => {
  it('should wrap the contents in an IIFE that registers the module in development', async () => {
    expect.assertions(5);

    const outputFileName = 'webpack-test-output-dev.js';
    const options = merge(webpackOptions, {
      mode: 'development',
      output: {
        filename: outputFileName,
      },
    });

    await waitForWebpack(options);

    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();

    expect(fileContents.startsWith('/******/ (() => { // webpackBootstrap')).toBe(true);
    expect(fileContents).toContain("const ID = 'external-a';");
    expect(fileContents).toContain('Holocron.registerExternal({ name: "external-a", version: "1.2.3", module: __holocron_external__external_a__1_2_3});');
    expect(fileContents).toContain("console.error('ERROR Registring External \"external-a\"', err)");
    expect(fileContents).toMatchSnapshot();
  });

  it('should wrap the contents in an IIFE that registers the module in production', async () => {
    expect.assertions(1);

    const outputFileName = 'webpack-test-output-prod.js';
    const options = merge(webpackOptions, {
      devtool: false,
      mode: 'production',
      output: {
        filename: outputFileName,
      },
    });

    await waitForWebpack(options);

    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();

    expect(fileContents).toContain('Holocron.registerExternal({name:"external-a",version:"1.2.3",module:__holocron_external__external_a__1_2_3})');
  });
});
