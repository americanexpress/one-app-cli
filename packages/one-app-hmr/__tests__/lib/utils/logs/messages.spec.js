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

import {
  printWebpack,
  printProxy,
  printMock,
  printLocale,
  printModuleMap,
  printStatics,
  logWebpackStatsWhenDone,
  logWhenWebpackInvalid,
  logHotReloadReady,
  logWebpackInit,
  logExternalsBuilding,
  logServerStart,
  logServerUrl,
  logExternalsBundleAnalyzerUrl,
  logModuleBundlerAnalyzerUrl,
  logRenderedHolocronModules,
  logProxyRequestMatch,
  logRemoteHasBeenLoadedCached,
  logMockAction,
  logMockWatchReady,
  warnOnMockWatchError,
  logScenariosRegistered,
  logLocaleAction,
  logModuleLanguagePacksLoaded,
  logLocaleModuleNamesBeingWatched,
  warnOnLocaleWatchError,
  logRemoteModulesLoaded,
  logLocalModulesLoaded,
  errorOnRemoteModuleMapResponse,
  errorOnRemoteModuleMapFetching,
  logStaticStep,
  logGitIgnoreAddition,
  logPullingDockerImage,
  logOneAppVersion,
} from '../../../../lib/utils/logs/messages';
import {
  info, log, warn, error, yellow, orange,
} from '../../../../lib/utils/logs/logs';

jest.mock('../../../../lib/utils/logs/logs');

beforeEach(() => {
  jest.clearAllMocks();
});

const bold = jest.fn((str) => str);
beforeAll(() => {
  orange.bold = bold;
  yellow.bold = bold;
});

describe('printers', () => {
  const message = 'msg';
  describe('printWebpack', () => {
    test('printWebpack', () => {
      expect(printWebpack(message)).toEqual(expect.any(String));
    });
  });

  describe('printProxy', () => {
    test('printProxy', () => {
      expect(printProxy(message)).toEqual(expect.any(String));
    });
  });

  describe('printMock', () => {
    test('printMock', () => {
      expect(printMock(message)).toEqual(expect.any(String));
    });
  });

  describe('printLocale', () => {
    test('printLocale', () => {
      expect(printLocale(message)).toEqual(expect.any(String));
    });
  });

  describe('printModuleMap', () => {
    test('printModuleMap', () => {
      expect(printModuleMap(message)).toEqual(expect.any(String));
    });
  });

  describe('printStatics', () => {
    test('printStatics', () => {
      expect(printStatics(message)).toEqual(expect.any(String));
    });
  });
});

describe('messages', () => {
  const port = 4000;
  const moduleName = 'some-module';
  const rootModuleName = 'root-module';
  const serverAddress = `http://localhost:${port}`;
  const remoteUrl = 'https://example.com/cdn/modules/my-module/my-module.browser.js';
  const request = { path: '/static/modules/my-module/my-module.browser.js' };
  const externals = ['react-external-pkg'];
  const modules = [{ name: moduleName }];
  describe('logWebpackStatsWhenDone', () => {
    test('logWebpackStatsWhenDone', () => {
      const stats = {
        startTime: 3124235,
        endTime: 3124235,
        compilation: {
          errors: ['error'],
          warnings: ['warning'],
        },
      };
      logWebpackStatsWhenDone(stats);
      expect(log).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWhenWebpackInvalid', () => {
    test('logWhenWebpackInvalid', () => {
      logWhenWebpackInvalid();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logHotReloadReady', () => {
    test('logHotReloadReady', () => {
      expect(logHotReloadReady()).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWebpackInit', () => {
    test('logWebpackInit', () => {
      expect(logWebpackInit()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logExternalsBuilding', () => {
    test('logExternalsBuilding', () => {
      expect(logExternalsBuilding(externals)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logServerStart', () => {
    test('logServerStart', () => {
      expect(logServerStart({ rootModuleName })).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logServerUrl', () => {
    test('logServerUrl', () => {
      expect(logServerUrl(serverAddress, port)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(2);
    });
  });

  describe('logExternalsBundleAnalyzerUrl', () => {
    test('logExternalsBundleAnalyzerUrl', () => {
      expect(logExternalsBundleAnalyzerUrl(serverAddress)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logModuleBundlerAnalyzerUrl', () => {
    test('logModuleBundlerAnalyzerUrl', () => {
      expect(logModuleBundlerAnalyzerUrl(serverAddress)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRenderedHolocronModules', () => {
    test('prints message about Holocron modules rendered', () => {
      expect(logRenderedHolocronModules(modules)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logProxyRequestMatch', () => {
    test('logProxyRequestMatch', () => {
      expect(logProxyRequestMatch(request)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRemoteHasBeenLoadedCached', () => {
    test('logRemoteHasBeenLoadedCached', () => {
      expect(logRemoteHasBeenLoadedCached(remoteUrl)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logMockAction', () => {
    test('logMockAction', () => {
      expect(
        logMockAction({ moduleName, fileName: 'scenarios.js', action: 'add' })
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logMockWatchReady', () => {
    test('logMockWatchReady', () => {
      expect(logMockWatchReady()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnOnMockWatchError', () => {
    test('warnOnMockWatchError', () => {
      expect(warnOnMockWatchError()).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logScenariosRegistered', () => {
    test('logScenariosRegistered', () => {
      expect(
        logScenariosRegistered({
          serverAddress,
          scenarios: {
            'my-mock': { request: '/parrot-mock' },
          },
        })
      ).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
    });
  });

  describe('logLocaleAction', () => {
    test('logLocaleAction', () => {
      expect(logLocaleAction({ action: 'change', locale: 'en-US', moduleName })).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logModuleLanguagePacksLoaded', () => {
    test('logModuleLanguagePacksLoaded', () => {
      expect(
        logModuleLanguagePacksLoaded({ moduleName, languagePacks: ['en-US'] })
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logLocaleModuleNamesBeingWatched', () => {
    test('logLocaleModuleNamesBeingWatched', () => {
      expect(logLocaleModuleNamesBeingWatched([moduleName])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnOnLocaleWatchError', () => {
    test('warnOnLocaleWatchError', () => {
      expect(warnOnLocaleWatchError()).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRemoteModulesLoaded', () => {
    test('logRemoteModulesLoaded', () => {
      expect(logRemoteModulesLoaded([], [])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(0);
      expect(
        logRemoteModulesLoaded(['my-module', 'other-module'], ['other-module'])
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logLocalModulesLoaded', () => {
    test('logLocalModulesLoaded', () => {
      expect(logLocalModulesLoaded(['other-module'])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('errorOnRemoteModuleMapResponse', () => {
    test('errorOnRemoteModuleMapResponse', () => {
      expect(errorOnRemoteModuleMapResponse()).toBeUndefined();
      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  describe('errorOnRemoteModuleMapFetching', () => {
    test('errorOnRemoteModuleMapFetching', () => {
      expect(errorOnRemoteModuleMapFetching()).toBeUndefined();
    });
  });

  describe('logStaticStep', () => {
    test('logStaticStep', () => {
      expect(logStaticStep()).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
    });
  });

  describe('logGitIgnoreAddition', () => {
    test('logGitIgnoreAddition', () => {
      expect(logGitIgnoreAddition()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logPullingDockerImage', () => {
    test('logPullingDockerImage', () => {
      expect(logPullingDockerImage()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logOneAppVersion', () => {
    test('logOneAppVersion', () => {
      expect(logOneAppVersion('v5')).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});
