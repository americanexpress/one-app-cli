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

import express from 'express';

import chokidar from 'chokidar';
import {
  loadScenarios, getModuleNameFromFilePath, createHotParrotMiddleware, loadParrotMiddleware,
} from '../../lib/parrot';

afterEach(() => {
  jest.clearAllMocks();
});
jest.disableAutomock();
jest.mock('jest-resolve');
jest.mock('express');
jest.mock('parrot-middleware');
const mockExpressRouter = {
  use: jest.fn(() => mockExpressRouter),
  get: jest.fn(() => mockExpressRouter),
  stack: ['test'],
};
express.Router.mockImplementation(() => mockExpressRouter);
jest.mock('chokidar', () => {
  const mockChokidar = {
    watch: jest.fn(() => mockChokidar),
    on: jest.fn(() => mockChokidar),
  };

  return mockChokidar;
});
describe('hot reloads parrot scenarios', () => {
  beforeEach(() => {
    console.log.mockClear();
    console.warn.mockClear();
    console.time.mockClear();
  });
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
  const scenariosMock = ['./logs'];
  const publish = () => jest.fn();
  it('loading scenarios ', () => {
    const loadScenariosMock = loadScenarios(scenariosMock);
    expect(loadScenariosMock.libName).toEqual('one-app-hmr');
  });
  it('get module name from file path', () => {
    expect(getModuleNameFromFilePath('sample-module/mock/scenarios.js')).toEqual('sample-module');
  });
  it('on error log the error', () => {
    createHotParrotMiddleware(scenariosMock, publish);
    chokidar.on.mock.calls[0][1]();
    expect(consoleWarnSpy.mock.calls).toMatchSnapshot();
    expect(chokidar.on.mock.calls[0][0]).toBe('error');
  });
  test('on ready watches scenarios', () => {
    createHotParrotMiddleware(scenariosMock, publish);
    chokidar.on.mock.calls[1][1]();
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
    expect(chokidar.on.mock.calls[1][0]).toBe('ready');
  });
  test('on add hot reload scenarios ', () => {
    createHotParrotMiddleware(scenariosMock, publish);
    chokidar.on.mock.calls[2][1]('sample-module/mock/scenarios.js');
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
    expect(chokidar.on.mock.calls[2][0]).toBe('add');
  });
  test('on change hot reload scenarios ', () => {
    createHotParrotMiddleware(scenariosMock, publish);
    chokidar.on.mock.calls[3][1]('sample-module/mock/scenarios.js');
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
    expect(chokidar.on.mock.calls[3][0]).toBe('change');
  });
  test('on unlink hot reload scenarios', () => {
    createHotParrotMiddleware(scenariosMock, publish);
    chokidar.on.mock.calls[4][1]('sample-module/mock/scenarios.js');
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
    expect(chokidar.on.mock.calls[4][0]).toBe('unlink');
  });
  test('loadParrotMiddleware are loaded', async () => {
    const scenarios = ['scenarios.js'];
    const useParrotMiddleware = true;
    await loadParrotMiddleware(mockExpressRouter, {
      scenarios,
      useParrotMiddleware,
      publish,
    });
    expect(chokidar.on.mock.calls[2][0]).toBe('add');
    expect(consoleTimeSpy.mock.calls).toMatchSnapshot();
  });
  test('parrot scenarios are not loaded', async () => {
    const parameters = {
      languagePacks: [],
      useLanguagePacks: true,
      publish,
    };

    await loadParrotMiddleware(mockExpressRouter, parameters);
    expect(consoleTimeSpy.mock.calls.length).toEqual(0);
  });
});
