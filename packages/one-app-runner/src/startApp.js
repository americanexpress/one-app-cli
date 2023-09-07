/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Docker = require('dockerode');

module.exports = async function startApp({
  moduleMapUrl,
  rootModuleName,
  modulesToServe,
  appDockerImage,
  envVars,
  outputFile,
  parrotMiddlewareFile,
  devEndpointsFile,
  createDockerNetwork,
  dockerNetworkToJoin,
  useHost,
  offline,
  containerName,
  useDebug,
}) {
  const generateEnvironmentVariableArgs = (vars) => {
    const environmentVariablesWithProxyAdditions = {
      ...vars,
      ...process.env.HTTP_PROXY && { HTTP_PROXY: JSON.stringify(process.env.HTTP_PROXY) },
      ...process.env.HTTPS_PROXY && { HTTPS_PROXY: JSON.stringify(process.env.HTTPS_PROXY) },
      ...process.env.NO_PROXY && { NO_PROXY: JSON.stringify(process.env.NO_PROXY) },
      ...process.env.HTTP_PORT && { HTTP_PORT: JSON.stringify(process.env.HTTP_PORT) },
      ...process.env.HTTP_ONE_APP_DEV_CDN_PORT
      && { HTTP_ONE_APP_DEV_CDN_PORT: JSON.stringify(process.env.HTTP_ONE_APP_DEV_CDN_PORT) },
      ...process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT
      && {
        HTTP_ONE_APP_DEV_PROXY_SERVER_PORT:
          JSON.stringify(process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT),
      },
      ...process.env.HTTP_METRICS_PORT && {
        HTTP_METRICS_PORT: JSON.stringify(process.env.HTTP_METRICS_PORT),
      },
    };
    return Object.keys(environmentVariablesWithProxyAdditions).reduce((accumulator, currentValue) => `${accumulator} -e "${currentValue}=${environmentVariablesWithProxyAdditions[currentValue]}"`, '');
  };

  const generateModuleMountsArgs = (modules) => {
    let args = '';
    if (modules && modules.length > 0) {
      args = modules.reduce((accumulator, currentValue) => {
        const moduleRootDir = path.basename(currentValue);
        return `${accumulator} -v "${currentValue}:/opt/module-workspace/${moduleRootDir}"`;
      }, '');
    }

    return args;
  };

  const generateCaCertsCommands = (vars = {}) => {
    const hostNodeExtraCaCerts = vars.NODE_EXTRA_CA_CERTS || process.env.NODE_EXTRA_CA_CERTS;
    if (hostNodeExtraCaCerts) {
      console.log('mounting host NODE_EXTRA_CA_CERTS');
      return `-v ${hostNodeExtraCaCerts}:/opt/certs.pem -e NODE_EXTRA_CA_CERTS='/opt/certs.pem'`;
    }
    return '';
  };

  const generateSetMiddlewareCommand = (pathToMiddlewareFile) => {
    if (pathToMiddlewareFile) {
      const pathArray = pathToMiddlewareFile.split(path.sep);
      return `npm run set-middleware '/opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]}' &&`;
    }
    return '';
  };

  const generateSetDevEndpointsCommand = (pathToDevEndpointsFile) => {
    if (pathToDevEndpointsFile) {
      const pathArray = pathToDevEndpointsFile.split(path.sep);
      return `npm run set-dev-endpoints '/opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]}' &&`;
    }
    return '';
  };

  const generateUseMocksFlag = (shouldUseMocks) => (shouldUseMocks ? '-m' : '');

  const generateServeModuleCommands = (modules) => {
    let command = '';
    if (modules && modules.length > 0) {
      modules.forEach((modulePath) => {
        const moduleRootDir = path.basename(modulePath);
        command += `npm run serve-module '/opt/module-workspace/${moduleRootDir}' &&`;
      });
    }
    return command;
  };

  const generateModuleMap = () => (moduleMapUrl ? `--module-map-url=${moduleMapUrl}` : '');

  const generateDebug = (port) => (useDebug ? `--inspect=0.0.0.0:${port}` : '');

  if (createDockerNetwork) {
    if (!dockerNetworkToJoin) {
      throw new Error(
        'createDockerNetwork is true but dockerNetworkToJoin is undefined, please pass a valid network name'
      );
    }
    try {
      const docker = new Docker();
      await docker.createNetwork({ name: dockerNetworkToJoin });
    } catch (e) {
      throw new Error(
        `Error creating docker network ${e}`
      );
    }
  }

  const generateNetworkToJoin = () => (dockerNetworkToJoin ? `--network=${dockerNetworkToJoin}` : '');
  const generateUseHostFlag = () => (useHost ? '--use-host' : '');
  const generatePullCommand = () => (offline ? '' : `docker pull ${appDockerImage} &&`);
  const generateContainerNameFlag = () => (containerName ? `--name=${containerName}` : '');
  const appPort = process.env.HTTP_PORT || 3000;
  const devCDNPort = process.env.HTTP_ONE_APP_DEV_CDN_PORT || 3001;
  const devProxyServerPort = process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT || 3002;
  const metricsPort = process.env.HTTP_METRICS_PORT || 3005;
  const debugPort = process.env.HTTP_ONE_APP_DEBUG_PORT || 9229;
  const ports = `-p ${appPort}:${appPort} -p ${devCDNPort}:${devCDNPort} -p ${devProxyServerPort}:${devProxyServerPort} -p ${metricsPort}:${metricsPort} -p ${debugPort}:${debugPort}`;

  const command = `${generatePullCommand()} docker run -t ${ports} -e NODE_ENV=development ${generateContainerNameFlag()} ${generateNetworkToJoin()} ${generateEnvironmentVariableArgs(envVars)} ${generateModuleMountsArgs(modulesToServe)} ${generateCaCertsCommands(envVars)} ${appDockerImage} /bin/sh -c "${generateServeModuleCommands(modulesToServe)} ${generateSetMiddlewareCommand(parrotMiddlewareFile)} ${generateSetDevEndpointsCommand(devEndpointsFile)} node ${generateDebug(debugPort)} lib/server/index.js --root-module-name=${rootModuleName} ${generateModuleMap()} ${generateUseMocksFlag(parrotMiddlewareFile)} ${generateUseHostFlag()}"`;
  const dockerProcess = spawn(command, { shell: true });
  dockerProcess.on('error', () => {
    throw new Error(
      'Error running docker. Are you sure you have it installed? For installation and setup details see https://www.docker.com/products/docker-desktop'
    );
  });
  [
    'SIGINT',
    'SIGTERM',
  ].forEach((signal) => {
    // process is a global referring to current running process https://nodejs.org/api/globals.html#globals_process
    /* istanbul ignore next */
    process.on(signal, () => 'noop - just need to pass signal to one app process so it can handle it');
  });

  if (outputFile) {
    const logFileStream = fs.createWriteStream(outputFile);
    dockerProcess.stdout.pipe(logFileStream);
    dockerProcess.stderr.pipe(logFileStream);
  } else {
    dockerProcess.stdout.pipe(process.stdout);
    dockerProcess.stderr.pipe(process.stderr);
  }
};
