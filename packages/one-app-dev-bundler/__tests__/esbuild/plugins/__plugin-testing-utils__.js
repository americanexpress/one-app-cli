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

// This function takes a valid esBuild plugin and runs its setup function.
// It returns to you all the hooks registered while the setup function was run.
// for hooks with no config, the shape will be:
// { <hookName>: [ <...hookFunctions> ] }
// for hooks with a config the shape will be:
// { <hookName>: [ { config: <config>, hookFunction: <hookFunction> }, ... ] }
// Hook functions will always be in the order registered if more than one under the same name
// is registered

export const runSetupAndGetLifeHooks = (plugin) => {
  const buildObjectMock = {};
  const hooks = {};

  const createHookSaver = (functionName) => (hookFunction) => {
    hooks[functionName] = hooks[functionName] || [];

    hooks[functionName].push(hookFunction);
  };

  const createConfigurableHookSaver = (functionName) => (config, hookFunction) => {
    hooks[functionName] = hooks[functionName] || [];

    hooks[functionName].push({ config, hookFunction });
  };

  buildObjectMock.onEnd = createHookSaver('onEnd');
  buildObjectMock.onStart = createHookSaver('onStart');
  buildObjectMock.onLoad = createConfigurableHookSaver('onLoad');
  buildObjectMock.onResolve = createConfigurableHookSaver('onResolve');

  plugin.setup(buildObjectMock);

  return hooks;
};

// This function takes an onLoad hook, a mock file name and content as `inputs`, and an options
// set of additional mock files if your loader reads more than just the input file.
// It will use mockFs to provide the mock inputs to the onLoad hook without mocking any functions.
// Then it will run the onLoad, and return the loaded value for you.
//
// This function should be called in a jest `it` test, and intends to be used for integration tests
// meaning that you should mock as little as possible, preferably nothing, that the onLoad hook does
export const runOnLoadHook = async (
  onLoadHook,
  { mockFileName, mockFileContent },
  additionalMockedFiles = {}
) => {
  // eslint-disable-next-line global-require -- importing this is incompatible with `jest.mock('fs' ...)`. So import this when the function is called so that tests that mock 'fs' can still import this file
  const mockFs = require('mock-fs');

  const mockOnLoadArgs = {
    path: `mock/path/to/file/${mockFileName}`,
  };
  // since plugins might load the file in odd ways, we need to use mock-fs
  mockFs({
    [mockOnLoadArgs.path]: mockFileContent,
    ...additionalMockedFiles,
  }, {
    createCwd: false,
    createTmp: false,
  });

  try {
    return await onLoadHook(mockOnLoadArgs);
  } finally {
    mockFs.restore();
  }
};
