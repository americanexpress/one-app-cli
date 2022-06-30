/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

/* eslint-disable global-require --
testing `on import` functionality needs 'require' in every tests */

jest.mock('read-pkg-up', () => ({ sync: jest.fn(() => ({ pkg: {} })) }));
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => 0);

describe('getConfigOptions', () => {
  let readPkgUp;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    readPkgUp = require('read-pkg-up');
  });

  it('should handle missing one-amex config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: {} });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions).not.toThrow();
  });

  it('should handle missing bundler config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { runner: {} } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions).not.toThrow();
  });

  it('should include app compatability', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { app: { compatibility: '^5.1.0' } } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ appCompatibility: '^5.1.0' });
  });

  it('should default purgecss to an empty object', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: {} });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ purgecss: {} });
  });

  it('should not override an existing purgecss config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { purgecss: { paths: ['foo'] } } } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ purgecss: { paths: ['foo'] } });
  });

  it('should throw when a user includes both requiredExternals and providedExternals configs', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { requiredExternals: ['a'], providedExternals: ['b'] } } } });
    expect(() => require('../../utils/getConfigOptions')).toThrowErrorMatchingSnapshot();
  });

  it('should allow a user to include requiredExternals', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { providedExternals: ['b'] } } } });
    expect(() => require('../../utils/getConfigOptions')).not.toThrow();
  });

  it('should throw when a user attempts to provide an app provided external', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { providedExternals: ['@americanexpress/one-app-ducks'] } } } });
    expect(() => require('../../utils/getConfigOptions')).toThrowErrorMatchingSnapshot();
  });

  it('should throw when a user attempts to use an app provided external from the root module', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { requiredExternals: ['@americanexpress/one-app-router'] } } } });
    expect(() => require('../../utils/getConfigOptions')).toThrowErrorMatchingSnapshot();
  });

  it('should warn when the user provides a custom webpack config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { webpackConfigPath: 'webpack.config.js' } } } });
    require('../../utils/getConfigOptions');
    expect(consoleWarnSpy).toHaveBeenCalledWith('@americanexpress/one-app-bundler: Using a custom webpack config can cause unintended side effects. Issues resulting from custom configuration will not be supported.');
  });

  it('should warn when the user provides a custom client webpack config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { webpackClientConfigPath: 'webpack.client.config.js' } } } });
    require('../../utils/getConfigOptions');
    expect(consoleWarnSpy).toHaveBeenCalledWith('@americanexpress/one-app-bundler: Using a custom webpack config can cause unintended side effects. Issues resulting from custom configuration will not be supported.');
  });

  it('should warn when the user provides a custom server webpack config', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { webpackServerConfigPath: 'webpack.config.js' } } } });
    require('../../utils/getConfigOptions');
    expect(consoleWarnSpy).toHaveBeenCalledWith('@americanexpress/one-app-bundler: Using a custom webpack config can cause unintended side effects. Issues resulting from custom configuration will not be supported.');
  });

  it('should throw when a user attempts to use both webpackConfigPath and webpackClientConfigPath', () => {
    const errorRegex = /@americanexpress\/one-app-bundler: Modules cannot configure both webpackConfigPath and webpackClientConfigPath or webpackServerConfigPath. See README for details./;
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { webpackConfigPath: 'webpack.config.js', webpackClientConfigPath: 'webpack.config.js' } } } });
    expect(() => require('../../utils/getConfigOptions')).toThrow(errorRegex);
  });

  it('should return disableDevelopmentLegacyBundle as true when config is set true and env is development', () => {
    process.env.NODE_ENV = 'development';
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { disableDevelopmentLegacyBundle: true } } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ disableDevelopmentLegacyBundle: true });
  });

  it('should return disableDevelopmentLegacyBundle as false when config is set true and env is production', () => {
    process.env.NODE_ENV = 'production';
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { disableDevelopmentLegacyBundle: true } } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ disableDevelopmentLegacyBundle: false });
  });

  it('should return disableDevelopmentLegacyBundle as false when config is set false and env is development', () => {
    readPkgUp.sync.mockReturnValueOnce({ packageJson: { 'one-amex': { bundler: { disableDevelopmentLegacyBundle: false } } } });
    const getConfigOptions = require('../../utils/getConfigOptions');
    expect(getConfigOptions()).toMatchObject({ disableDevelopmentLegacyBundle: false });
  });
});

/* eslint-enable global-require -- disables require enables */
