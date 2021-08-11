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

const log = require('../src/utils/log');
const installTemplate = require('../src/utils/install-template');
const installModule = require('../src/utils/install-module');
const getBaseOptions = require('../src/utils/get-base-options');
const walkTemplate = require('../src/utils/walk-template');
const initializeGitRepo = require('../src/utils/initialize-git-repo');

const generateFromTemplate = require('../src/generate-from-template');

jest.mock('prompts', () => 'promptsMock');
jest.mock('../src/utils/log', () => ({
  generatorBanner: jest.fn(),
  stepBanner: jest.fn(),
}));
jest.mock('../src/utils/install-template', () => jest.fn());
jest.mock('../src/utils/install-module', () => jest.fn());
jest.mock('../src/utils/get-base-options', () => jest.fn(() => 'baseOptionsMock'));
jest.mock('../src/utils/walk-template', () => jest.fn());
jest.mock('../src/utils/initialize-git-repo', () => jest.fn());
jest.mock('@americanexpress/holocron-module-template', () => ({
  getTemplateOptions: jest.fn(() => ({
    templateValues: { moduleName: 'moduleNameMock' },
    dynamicFileNames: 'dynamicFileNamesMock',
    ignoredFileNames: 'ignoredFileNamesMock',
  })),
  getTemplatePaths: jest.fn(() => ['path1Mock', 'path2Mock']),
}));

describe('generateFromTemplate', () => {
  let templatePackage;
  beforeEach(() => {
    // eslint-disable-next-line import/no-extraneous-dependencies,global-require
    templatePackage = require('@americanexpress/holocron-module-template');
    jest.clearAllMocks();
  });
  it('should call the generatorBanner, and all 5 steps', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(log.generatorBanner).toHaveBeenCalledTimes(1);
    expect(log.generatorBanner).toHaveBeenNthCalledWith(1);

    expect(log.stepBanner).toHaveBeenCalledTimes(5);
    expect(log.stepBanner).toHaveBeenNthCalledWith(1, 1);
    expect(log.stepBanner).toHaveBeenNthCalledWith(2, 2);
    expect(log.stepBanner).toHaveBeenNthCalledWith(3, 3);
    expect(log.stepBanner).toHaveBeenNthCalledWith(4, 4);
    expect(log.stepBanner).toHaveBeenNthCalledWith(5, 5);
  });

  // Step 1
  it('should install the template passed', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(installTemplate).toHaveBeenCalledTimes(1);
    expect(installTemplate).toHaveBeenNthCalledWith(1, '@americanexpress/holocron-module-template@1.0.0');
  });

  it('should install the template named in the env var override if present', async () => {
    process.env.DEV_TEMPLATE_NAME_OVERRIDE = '@americanexpress/holocron-module-template';
    await expect(async () => generateFromTemplate({ templateName: 'someOtherPackageName' })).not.toThrow();
    delete process.env.DEV_TEMPLATE_NAME_OVERRIDE;
  });

  // Step 2
  it('should get the base options, template options, and template paths', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(getBaseOptions).toHaveBeenCalledTimes(1);
    expect(getBaseOptions).toHaveBeenNthCalledWith(1);

    expect(templatePackage.getTemplateOptions).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplateOptions).toHaveBeenNthCalledWith(1, 'baseOptionsMock', 'promptsMock');

    expect(templatePackage.getTemplatePaths).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplatePaths).toHaveBeenNthCalledWith(1);
  });

  it('should take defaults for the non-required keys in getTemplateOptions', async () => {
    templatePackage.getTemplateOptions.mockImplementationOnce(() => ({ templateValues: { moduleName: 'moduleNameMock' } }));
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(getBaseOptions).toHaveBeenCalledTimes(1);
    expect(getBaseOptions).toHaveBeenNthCalledWith(1);

    expect(templatePackage.getTemplateOptions).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplateOptions).toHaveBeenNthCalledWith(1, 'baseOptionsMock', 'promptsMock');

    expect(templatePackage.getTemplatePaths).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplatePaths).toHaveBeenNthCalledWith(1);
  });

  // Step 3
  it('should call walk template for each path', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(walkTemplate).toHaveBeenCalledTimes(2);
    expect(walkTemplate).toHaveBeenNthCalledWith(1, 'path1Mock', './moduleNameMock', {
      templateValues: { moduleName: 'moduleNameMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
    });
    expect(walkTemplate).toHaveBeenNthCalledWith(2, 'path2Mock', './moduleNameMock', {
      templateValues: { moduleName: 'moduleNameMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
    });
  });

  // Step 4
  it('should install the module', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(installModule).toHaveBeenCalledTimes(1);
    expect(installModule).toHaveBeenNthCalledWith(1, './moduleNameMock');
  });

  // Step 5
  it('should initialize the git repo', async () => {
    await generateFromTemplate({ templateName: '@americanexpress/holocron-module-template@1.0.0' });

    expect(initializeGitRepo).toHaveBeenCalledTimes(1);
    expect(initializeGitRepo).toHaveBeenNthCalledWith(1, './moduleNameMock');
  });
});
