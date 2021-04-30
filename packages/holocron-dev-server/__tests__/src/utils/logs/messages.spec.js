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
} from '../../../../src/utils/logs/messages';
import {
  info, log, warn, logError, yellow, orange,
} from '../../../../src/utils/logs/logs';

jest.mock('../../../../src/utils/logs/logs');

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
  describe('print webpack messages', () => {
    test('printWebpack', () => {
      expect(printWebpack(message)).toEqual(expect.any(String));
    });
  });

  describe('print proxy request messages', () => {
    test('printProxy', () => {
      expect(printProxy(message)).toEqual(expect.any(String));
    });
  });

  describe('printMock', () => {
    test('print mock interactions message', () => {
      expect(printMock(message)).toEqual(expect.any(String));
    });
  });

  describe('printLocale', () => {
    test('print locale interactions messages', () => {
      expect(printLocale(message)).toEqual(expect.any(String));
    });
  });

  describe('printModuleMap', () => {
    test('print module map interactions', () => {
      expect(printModuleMap(message)).toEqual(expect.any(String));
    });
  });

  describe('printStatics', () => {
    test('print statics interactions', () => {
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
    test('log webpack statistics when done', () => {
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
      expect(logError).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWhenWebpackInvalid', () => {
    test('log when webpack is invalid', () => {
      logWhenWebpackInvalid();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logHotReloadReady', () => {
    test('log when hot reload is ready', () => {
      expect(logHotReloadReady()).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWebpackInit', () => {
    test('log webpack when webpack is initialized', () => {
      expect(logWebpackInit()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logExternalsBuilding', () => {
    test('log when externals are being built', () => {
      expect(logExternalsBuilding(externals)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logServerStart', () => {
    test('log when the server starts', () => {
      expect(logServerStart({ rootModuleName })).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logServerUrl', () => {
    test('log when the server url is loaded ', () => {
      expect(logServerUrl(serverAddress, port)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(2);
    });
  });

  describe('logExternalsBundleAnalyzerUrl', () => {
    test('log the externals bundler analyzer url', () => {
      expect(logExternalsBundleAnalyzerUrl(serverAddress)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
    test('log the externals bundler analyzer ur with externals', () => {
      expect(logExternalsBundleAnalyzerUrl(serverAddress, externals)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logModuleBundlerAnalyzerUrl', () => {
    test('log the module bundler analyzer url', () => {
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
    test('log when proxy requests match ', () => {
      expect(logProxyRequestMatch(request)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRemoteHasBeenLoadedCached', () => {
    test('log when the remote has been loaded and cached', () => {
      expect(logRemoteHasBeenLoadedCached(remoteUrl)).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logMockAction', () => {
    test('log when mock scenarios are loaded', () => {
      expect(
        logMockAction({ moduleName, fileName: 'scenarios.js', action: 'add' })
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logMockWatchReady', () => {
    test('log when mock scenarios are being watched for changes ', () => {
      expect(logMockWatchReady()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnOnMockWatchError', () => {
    test('log a warning when an error occurs while watching mock scenarios', () => {
      expect(warnOnMockWatchError()).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logScenariosRegistered', () => {
    test('log when scenarios routes are registered', () => {
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
    test('log when locale has any changes ', () => {
      expect(logLocaleAction({ action: 'change', locale: 'en-US', moduleName })).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logModuleLanguagePacksLoaded', () => {
    test('log when language pack is loaded', () => {
      expect(
        logModuleLanguagePacksLoaded({ moduleName, languagePacks: ['en-US'] })
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logLocaleModuleNamesBeingWatched', () => {
    test('log when modules are being watched', () => {
      expect(logLocaleModuleNamesBeingWatched([moduleName])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnOnLocaleWatchError', () => {
    test('log when error occurs when loading locales', () => {
      expect(warnOnLocaleWatchError()).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRemoteModulesLoaded', () => {
    test('log when remote modules are loaded', () => {
      expect(logRemoteModulesLoaded([], [])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(0);
      expect(
        logRemoteModulesLoaded(['my-module', 'other-module'], ['other-module'])
      ).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logLocalModulesLoaded', () => {
    test('log when locale modules are loaded', () => {
      expect(logLocalModulesLoaded(['other-module'])).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('errorOnRemoteModuleMapResponse', () => {
    test('log when an error response is registered when loading module map', () => {
      expect(errorOnRemoteModuleMapResponse()).toBeUndefined();
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe('errorOnRemoteModuleMapFetching', () => {
    test('log when an error occurs when fetching module map', () => {
      expect(errorOnRemoteModuleMapFetching('error')).toBeUndefined();
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe('logStaticStep', () => {
    test('log when statics are loaded ', () => {
      expect(logStaticStep()).toBeUndefined();
      expect(info).toHaveBeenCalledTimes(1);
    });
  });

  describe('logGitIgnoreAddition', () => {
    test('log when files are added to git ignore', () => {
      expect(logGitIgnoreAddition()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logPullingDockerImage', () => {
    test('log when pulling docker image', () => {
      expect(logPullingDockerImage()).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logOneAppVersion', () => {
    test('log One App version', () => {
      expect(logOneAppVersion('v5')).toBeUndefined();
      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});
