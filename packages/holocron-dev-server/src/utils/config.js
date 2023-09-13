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

import path from 'node:path';
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
} = {}) {
  return {
    modules: modules.map((relativeModulePath) => path.resolve(getContextPath(), relativeModulePath)
    ),
    remoteModuleMapUrl: moduleMapUrl,
    environmentVariables: envVars,
    rootModuleName,
    dockerImage,
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
    providedExternals,
    requiredExternals,
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
        providedExternals, requiredExternals, environmentVariables,
      } = {
        ...extractBundlerOptions(bundler),
        ...extractRunnerOptions(runner),
        ...extractHmrOptions(hmr),
      };
      const { moduleName } = moduleConfig;
      return {
        ...moduleConfig,
        moduleName,
        providedExternals,
        requiredExternals,
        environmentVariables,
        rootModule: moduleName === context.rootModuleName,
        // add the local url path for the module
        src: getPublicModulesUrl(createModuleScriptUrl(moduleName)),
      };
    }));
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
  };
}

export async function createConfig() {
  const entryConfig = await getPackageJsonConfig();
  const context = createConfigurationContext(entryConfig);
  const modules = await createModulesConfig(context);

  const serverAddress = `http://localhost:${context.port}/`;

  return {
    ...context,
    modules,
    serverAddress,
  };
}
