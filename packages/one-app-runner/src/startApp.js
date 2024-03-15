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

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const Docker = require('dockerode');

const spawnAndPipe = require('./spawnAndPipe');
const startAppContainer = require('./startAppContainer');
const {
  generateEnvironmentVariableArgs,
  generateSetMiddlewareCommand,
  generateSetDevEndpointsCommand,
  generateUseMocksFlag,
  generateNpmConfigCommands,
  generateServeModuleCommands,
  generateModuleMap,
  generateLogLevel,
  generateLogFormat,
  generateDebug,
  generateNodeFlags,
} = require('./generateContainerArgs');

async function dockerPull(imageReference, logStream) {
  return spawnAndPipe('docker', ['pull', imageReference], logStream);
}

module.exports = async function startApp({
  moduleMapUrl,
  rootModuleName,
  modulesToServe,
  appDockerImage,
  envVars = {},
  outputFile,
  parrotMiddlewareFile,
  devEndpointsFile,
  createDockerNetwork,
  dockerNetworkToJoin,
  useHost,
  offline,
  containerName,
  useDebug,
  logLevel,
  logFormat,
}) {
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

  const generateUseHostFlag = () => (useHost ? '--use-host' : '');

  const appPort = Number.parseInt(process.env.HTTP_PORT, 10) || 3000;
  const devCDNPort = Number.parseInt(process.env.HTTP_ONE_APP_DEV_CDN_PORT, 10) || 3001;
  const devProxyServerPort = Number.parseInt(
    process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT, 10
  ) || 3002;
  const metricsPort = Number.parseInt(process.env.HTTP_METRICS_PORT, 10) || 3005;
  const debugPort = Number.parseInt(process.env.HTTP_ONE_APP_DEBUG_PORT, 10) || 9229;

  const ports = [
    appPort,
    devCDNPort,
    devProxyServerPort,
    metricsPort,
    debugPort,
  ];

  const containerEnvVars = generateEnvironmentVariableArgs(envVars);

  const mounts = new Map([
    ...(modulesToServe || []).map((moduleToServe) => [moduleToServe, `/opt/module-workspace/${path.basename(moduleToServe)}`]),
  ]);

  const hostNodeExtraCaCerts = envVars.NODE_EXTRA_CA_CERTS || process.env.NODE_EXTRA_CA_CERTS;
  if (hostNodeExtraCaCerts) {
    console.log('mounting host NODE_EXTRA_CA_CERTS');
    const mountPath = '/opt/certs.pem';
    mounts.set(hostNodeExtraCaCerts, mountPath);
    containerEnvVars.set('NODE_EXTRA_CA_CERTS', mountPath);
  }

  const appVersion = appDockerImage.split(':')[1];

  const containerShellCommand = [
    generateNpmConfigCommands(),
    generateServeModuleCommands(modulesToServe),
    generateSetMiddlewareCommand(parrotMiddlewareFile),
    generateSetDevEndpointsCommand(devEndpointsFile),
    'node',
    generateNodeFlags(appVersion),
    generateDebug(debugPort, useDebug),
    `lib/server/index.js --root-module-name=${rootModuleName}`,
    generateModuleMap(moduleMapUrl),
    generateUseMocksFlag(parrotMiddlewareFile),
    generateUseHostFlag(),
    generateLogLevel(logLevel),
    generateLogFormat(logFormat),
  ].filter(Boolean).join(' ');

  const logFileStream = outputFile ? fs.createWriteStream(outputFile) : null;

  const hostOneAppDirectoryPath = path.resolve(os.homedir(), '.one-app');
  mounts.set(hostOneAppDirectoryPath, '/home/node/.one-app');
  try {
    await fs.promises.mkdir(hostOneAppDirectoryPath);
  } catch (errorCreatingOneAppDirectory) {
    if (errorCreatingOneAppDirectory.code !== 'EEXIST') {
      mounts.delete(hostOneAppDirectoryPath);
      console.warn(`Unable to ensure ~/.one-app exists, the module cache will not be used (${errorCreatingOneAppDirectory.message})`);
    }
  }

  try {
    if (!offline) {
      await dockerPull(appDockerImage, logFileStream);
    }
    await startAppContainer({
      imageReference: appDockerImage,
      ports,
      envVars: containerEnvVars,
      mounts,
      containerShellCommand,
      name: containerName,
      network: dockerNetworkToJoin,
      logStream: logFileStream,
    });
  } catch (error) {
    throw new Error(
      'Error running docker. Are you sure you have it installed? For installation and setup details see https://www.docker.com/products/docker-desktop',
      { cause: error }
    );
  } finally {
    if (logFileStream) {
      logFileStream.end();
    }
  }
};
