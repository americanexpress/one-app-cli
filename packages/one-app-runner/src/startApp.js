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
const semver = require('semver');
const spawnAndPipe = require('../utils/spawnAndPipe');
const {
  dockerPull,
  portsToDockerArgs,
  envVarsToDockerArgs,
  mountsToDockerArgs,
} = require('../utils/docker');
const objectToFlags = require('../utils/objectToFlags');
const pick = require('../utils/pick');
const { startJaeger, getJaegerEnvVarsForOneApp } = require('./startJaeger');

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
      portsToDockerArgs(ports),
      envVarsToDockerArgs(envVars),
      mountsToDockerArgs(mounts),
      objectToFlags({
        name,
        network,
      }),
      imageReference,
      '/bin/sh',
      '-c',
      containerShellCommand,
    ].flat(),
    logStream
  );
}

function generateEnvironmentVariableArgs({
  envVars,
  includeJaeger,
  rootModuleName,
  dockerNetworkToJoin,
}) {
  const envVarsFromProcess = pick(['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'HTTP_PORT', 'HTTP_ONE_APP_DEV_CDN_PORT', 'HTTP_ONE_APP_DEV_PROXY_SERVER_PORT', 'HTTP_METRICS_PORT'], process.env);
  return new Map([
    [['NODE_ENV', 'development']],
    Object.entries(envVars),
    Object.entries(getJaegerEnvVarsForOneApp({
      includeJaeger,
      useDockerNetwork: !!dockerNetworkToJoin,
      rootModuleName,
    })),
    Object.entries(envVarsFromProcess),
  ].flat(1));
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

const generateNpmConfigCommands = () => 'npm config set update-notifier false &&';

const generateServeModuleCommands = (modules) => {
  if (!modules || modules.length === 0) {
    return '';
  }

  let command = 'npm run serve-module';
  modules.forEach((modulePath) => {
    const moduleRootDir = path.basename(modulePath);
    command += ` '/opt/module-workspace/${moduleRootDir}'`;
  });
  return `${command} &&`;
};

const generateDebug = (port, useDebug) => (useDebug ? `--inspect=0.0.0.0:${port}` : '');

// NOTE: Node 12 does not support --dns-result-order or --no-experimental-fetch
// So we have to remove those flags if the one-app version does not intersect ^5.13.0 or ^6.6.0
// 5.13.0 is when node 16 was introduced.
const generateNodeFlags = (appVersion) => {
  if (semver.intersects(appVersion, '^5.13.0 || ^6.6.0', { includePrerelease: true })) {
    return '--dns-result-order=ipv4first --no-experimental-fetch';
  }
  return '';
};

const generateEntryCommand = (appVersion, debugPort, useDebug) => {
  const debug = generateDebug(debugPort, useDebug);
  if (appVersion === 'latest' || semver.intersects(appVersion, '>=6.11.0-0', { includePrerelease: true })) {
    return ['scripts/start.sh', debug];
  }
  return ['node', generateNodeFlags(appVersion), debug, 'lib/server/index.js'];
};

module.exports = async function startApp({
  moduleMapUrl,
  rootModuleName,
  modulesToServe = [],
  appDockerImage,
  envVars = {},
  outputFile,
  parrotMiddlewareFile,
  devEndpointsFile,
  createDockerNetwork,
  dockerNetworkToJoin,
  includeJaeger,
  useHost,
  offline,
  containerName,
  useDebug,
  logLevel,
  logFormat,
}) {
  if (createDockerNetwork) {
    try {
      const docker = new Docker();
      await docker.createNetwork({ name: dockerNetworkToJoin });
    } catch (e) {
      throw new Error(
        `Error creating docker network ${e}`
      );
    }
  }

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

  const containerEnvVars = generateEnvironmentVariableArgs({
    envVars,
    includeJaeger,
    rootModuleName,
    dockerNetworkToJoin,
  });

  const mounts = new Map(modulesToServe.map((moduleToServe) => [moduleToServe, `/opt/module-workspace/${path.basename(moduleToServe)}`]));

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
    generateEntryCommand(appVersion, debugPort, useDebug),
    objectToFlags({
      rootModuleName,
      moduleMapUrl,
      m: parrotMiddlewareFile && true,
      useHost,
      logLevel,
      logFormat,
    }),
  ].flat().filter(Boolean).join(' ');

  const logStream = outputFile ? fs.createWriteStream(outputFile) : process.stdout;

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

  let jaegerProcess;

  try {
    if (!offline) {
      await dockerPull(appDockerImage, logStream);
    }
    if (includeJaeger) {
      jaegerProcess = await startJaeger({
        network: dockerNetworkToJoin,
        logStream,
        offline,
      });
    }
    await startAppContainer({
      imageReference: appDockerImage,
      ports,
      envVars: containerEnvVars,
      mounts,
      containerShellCommand,
      name: containerName,
      network: dockerNetworkToJoin,
      logStream,
    });
  } catch (error) {
    throw new Error(
      'Error running docker. Are you sure you have it installed? For installation and setup details see https://www.docker.com/products/docker-desktop',
      { cause: error }
    );
  } finally {
    if (outputFile) {
      logStream.end();
    }
    jaegerProcess?.kill();
  }

  [
    'SIGINT',
    'SIGTERM',
  ].forEach((signal) => {
    // process is a global referring to current running process https://nodejs.org/api/globals.html#globals_process
    /* istanbul ignore next */
    process.on(signal, () => {
      // need to pass signal to one app process so it can handle it
      jaegerProcess?.kill();
    });
  });
};
