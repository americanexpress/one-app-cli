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
const path = require('node:path');
const fs = require('node:fs');
const Docker = require('dockerode');

async function dockerPull(imageReference) {
  return new Promise((resolve, reject) => {
    const pullProcess = spawn('docker', ['pull', imageReference]);
    pullProcess.stdout.pipe(process.stdout);
    pullProcess.stderr.pipe(process.stderr);
    pullProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
      return resolve(code);
    });
  });
}

async function startAppContainer({
  imageReference,
  containerShellCommand,
  ports=[],
  envVars = new Map(),
  mounts = new Map(),
  name,
  network,
  outputFile,
}) {
  return new Promise((resolve, reject) => {
    const runProcess = spawn(
      'docker',
      [
        'run',
        '-t',
        ...ports.map((port) => `-p=${port}:${port}`),
        ...[...envVars.entries()].map(([envVarName, envVarValue]) => `-e=${envVarName}=${envVarValue}`),
        ...[...mounts.entries()].map(([hostPath, containerPath]) => `-v=${hostPath}:${containerPath}`),
        name ? `--name=${name}` : null,
        network ? `--network=${network}` : null,
        imageReference,
        '/bin/sh',
        '-c',
        containerShellCommand,
      ].filter(Boolean)
    );

    runProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
      return resolve(code);
    });

    if (outputFile) {
      const logFileStream = fs.createWriteStream(outputFile);
      runProcess.stdout.pipe(logFileStream);
      runProcess.stderr.pipe(logFileStream);
    } else {
      runProcess.stdout.pipe(process.stdout);
      runProcess.stderr.pipe(process.stderr);
    }
  });
}

function generateEnvironmentVariableArgs(envVars) {
  return new Map([
    ['NODE_ENV', 'development'],
    ...Object.entries(envVars),
    process.env.HTTP_PROXY ? ['HTTP_PROXY', process.env.HTTP_PROXY] : null,
    process.env.HTTPS_PROXY ? ['HTTPS_PROXY', process.env.HTTPS_PROXY] : null,
    process.env.NO_PROXY ? ['NO_PROXY', process.env.NO_PROXY] : null,
    process.env.HTTP_PORT ? ['HTTP_PORT', process.env.HTTP_PORT] : null,
    process.env.HTTP_ONE_APP_DEV_CDN_PORT
      ? ['HTTP_ONE_APP_DEV_CDN_PORT', process.env.HTTP_ONE_APP_DEV_CDN_PORT]
      : null,
    process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT
      ? ['HTTP_ONE_APP_DEV_PROXY_SERVER_PORT', process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT]
      : null,
    process.env.HTTP_METRICS_PORT
      ? ['HTTP_METRICS_PORT', process.env.HTTP_METRICS_PORT]
      : null,
  ].filter(Boolean));
}

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

const generateModuleMap = (moduleMapUrl) => (moduleMapUrl ? `--module-map-url=${moduleMapUrl}` : '');

const generateDebug = (port, useDebug) => (useDebug ? `--inspect=0.0.0.0:${port}` : '');

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
    ...(modulesToServe || []).map((currentValue) => [currentValue, `/opt/module-workspace/${path.basename(currentValue)}`]),
  ]);

  const hostNodeExtraCaCerts = envVars.NODE_EXTRA_CA_CERTS || process.env.NODE_EXTRA_CA_CERTS;
  if (hostNodeExtraCaCerts) {
    console.log('mounting host NODE_EXTRA_CA_CERTS');
    const mountPath = '/opt/certs.pem';
    mounts.set(hostNodeExtraCaCerts, mountPath);
    containerEnvVars.set('NODE_EXTRA_CA_CERTS', mountPath);
  }

  const containerShellCommand = `${
    generateServeModuleCommands(modulesToServe)
  } ${
    generateSetMiddlewareCommand(parrotMiddlewareFile)
  } ${
    generateSetDevEndpointsCommand(devEndpointsFile)
  } node ${
    generateDebug(debugPort, useDebug)
  } lib/server/index.js --root-module-name=${rootModuleName} ${
    generateModuleMap(moduleMapUrl)
  } ${
    generateUseMocksFlag(parrotMiddlewareFile)
  } ${
    generateUseHostFlag()
  }`;

  try {
    if (!offline) {
      await dockerPull(appDockerImage);
    }
    await startAppContainer({
      imageReference: appDockerImage,
      ports,
      envVars: containerEnvVars,
      mounts,
      containerShellCommand,
      name: containerName,
      network: dockerNetworkToJoin,
      outputFile,
    });
  } catch (error) {
    throw new Error(
      'Error running docker. Are you sure you have it installed? For installation and setup details see https://www.docker.com/products/docker-desktop',
      { cause: error }
    );
  }

  [
    'SIGINT',
    'SIGTERM',
  ].forEach((signal) => {
    // process is a global referring to current running process https://nodejs.org/api/globals.html#globals_process
    /* istanbul ignore next */
    process.on(signal, () => 'noop - just need to pass signal to one app process so it can handle it');
  });
};
