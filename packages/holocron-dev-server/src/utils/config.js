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

import path from 'path';
import readPkgUp from 'read-pkg-up';

import { defaultLogLevel, errorReportingUrlFragment, oneAppDockerImageName } from '../constants';
import { createModuleScriptUrl, getContextPath, getPublicModulesUrl } from './paths';

export const ONE_AMEX_CONFIG_KEY = 'one-amex';
export const BUNDLER_CONFIG_KEY = 'bundler';
export const RUNNER_CONFIG_KEY = 'runner';
export const HMR_CONFIG_KEY = 'hmr';

async function getPackageJsonConfig(modulePath = getContextPath()) {
  const {
    packageJson: {
      [ONE_AMEX_CONFIG_KEY]: {
        [BUNDLER_CONFIG_KEY]: bundler,
        [RUNNER_CONFIG_KEY]: runner,
        [HMR_CONFIG_KEY]: hmr,
      } = {},
      name: moduleName,
      version: moduleVersion,
    },
  } = await readPkgUp({ cwd: modulePath });
  return {
    hmr,
    runner,
    bundler,
    moduleName,
    moduleVersion,
    modulePath,
  };
}

export function extractRunnerOptions({
  modules = [],
  rootModuleName,
  moduleMapUrl,
  dockerImage,
  envVars,
  offline,
} = {}) {
  return {
    modules: modules.map((relativeModulePath) => path.resolve(getContextPath(), relativeModulePath)
    ),
    remoteModuleMapUrl: moduleMapUrl,
    environmentVariables: envVars,
    rootModuleName,
    dockerImage,
    offline,
  };
}

export function extractBundlerOptions({
  providedExternals = [],
  requiredExternals = [],
  performanceBudget,
  webpackConfigPath,
  webpackClientConfigPath,
  purgecss,
} = {}) {
  return {
    externals: [].concat(providedExternals, requiredExternals),
    webpackConfigPath: webpackClientConfigPath || webpackConfigPath,
    performanceBudget,
    purgecss,
  };
}

export function extractHmrOptions({
  clientConfig = {},
  sourceMap,
  openWhenReady = false,
  logLevel,
  port,
} = {}) {
  return {
    clientConfig: {
      errorReportingUrl: errorReportingUrlFragment,
      ...clientConfig,
    },
    sourceMap,
    openWhenReady,
    logLevel,
    port,
  };
}

export function createModulesConfig(context) {
  return Promise.all(context.modules.map(getPackageJsonConfig))
    .then((modules) => modules.map(({
      bundler, runner, hmr, ...moduleConfig
    }) => {
      const {
        externals, providedExternals, requiredExternals, environmentVariables,
      } = {
        ...extractBundlerOptions(bundler),
        ...extractRunnerOptions(runner),
        ...extractHmrOptions(hmr),
      };
      const { moduleName } = moduleConfig;
      return {
        ...moduleConfig,
        moduleName,
        externals,
        providedExternals,
        requiredExternals,
        environmentVariables,
        rootModule: moduleName === context.rootModuleName,
        // add the local url path for the module
        src: getPublicModulesUrl(createModuleScriptUrl(moduleName)),
      };
    })
    )
    .then((modules) => {
      const externals = [
        ...new Set(
          modules
            .map(({ externals: moduleExternals }) => moduleExternals)
            .reduce((externalsArray, moduleExternals) => externalsArray.concat(moduleExternals), [])
        ).values(),
      ];
      return {
        modules,
        externals,
      };
    });
}

export function createConfigurationContext({
  bundler,
  runner,
  hmr,
  moduleName,
  modulePath,
  moduleVersion,
}) {
  const {
    modules,
    externals,
    rootModuleName = moduleName,
    dockerImage = oneAppDockerImageName,
    logLevel = defaultLogLevel,
    port = 4000,
    remoteModuleMapUrl,
    environmentVariables,
    openWhenReady,
    clientConfig,
    sourceMap,
    webpackConfigPath,
    performanceBudget,
    purgecss,
    offline = false,
  } = {
    ...extractBundlerOptions(bundler),
    ...extractRunnerOptions(runner),
    ...extractHmrOptions(hmr),
  };

  if (!modules.find((pathName) => pathName === modulePath)) {
    modules.unshift(modulePath);
  }

  return {
    moduleName,
    modulePath,
    moduleVersion,
    modules,
    externals,
    logLevel,
    port,
    dockerImage,
    rootModuleName,
    remoteModuleMapUrl,
    environmentVariables,
    openWhenReady,
    clientConfig,
    sourceMap,
    webpackConfigPath,
    performanceBudget,
    purgecss,
    offline,
  };
}

export async function createConfig() {
  const entryConfig = await getPackageJsonConfig();
  const context = createConfigurationContext(entryConfig);
  const { modules, externals } = await createModulesConfig(context);

  const serverAddress = `http://localhost:${context.port}/`;

  return {
    ...context,
    modules,
    externals,
    serverAddress,
  };
}
