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
const os = require('node:os');
const Docker = require('dockerode');
const semver = require('semver');

async function spawnAndPipe(command, args, logStream) {
  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn(command, args);

    spawnedProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
      return resolve(code);
    });

    if (logStream) {
      spawnedProcess.stdout.pipe(logStream, { end: false });
      spawnedProcess.stderr.pipe(logStream, { end: false });
    } else {
      spawnedProcess.stdout.pipe(process.stdout);
      spawnedProcess.stderr.pipe(process.stderr);
    }
  });
}

async function dockerPull(imageReference, logStream) {
  return spawnAndPipe('docker', ['pull', imageReference], logStream);
}

async function startAppContainer({
  imageReference,
  containerShellCommand,
  ports /* = [] */,
  envVars /* = new Map() */,
  mounts /* = new Map() */,
  name,
  network,
  logStream,
}) {
  return spawnAndPipe(
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
    ].filter(Boolean),
    logStream
  );
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

const generateNpmConfigCommands = () => 'npm config set update-notifier false &&';

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

const generateLogLevel = (logLevel) => (logLevel ? `--log-level=${logLevel}` : '');

const generateLogFormat = (logFormat) => (logFormat ? `--log-format=${logFormat}` : '');

const generateDebug = (port, useDebug) => (useDebug ? `--inspect=0.0.0.0:${port}` : '');

// NOTE: Node 12 does not support --dns-result-order or --no-experimental-fetch
// So we have to remove those flags if the one-app version is less than 5.13.0
// 5.13.0 is when node 16 was introduced.
const generateNodeFlags = (appVersion) => {
  if (appVersion === 'latest' ? true : semver.intersects(appVersion, '^5.13.0', { includePrerelease: true })) {
    return '--dns-result-order=ipv4first --no-experimental-fetch';
  }
  return '';
};

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

  [
    'SIGINT',
    'SIGTERM',
  ].forEach((signal) => {
    // process is a global referring to current running process https://nodejs.org/api/globals.html#globals_process
    /* istanbul ignore next */
    process.on(signal, () => 'noop - just need to pass signal to one app process so it can handle it');
  });
};
