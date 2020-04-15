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

module.exports = async function startApp({
  moduleMapUrl,
  rootModuleName,
  modulesToServe,
  appDockerImage,
  envVars,
  outputFile,
  parrotMiddlewareFile,
  devEndpointsFile,
}) {
  const generateEnvironmentVariableArgs = (vars) => {
    const environmentVariablesWithProxyAdditions = {
      ...vars,
      ...process.env.HTTP_PROXY && { HTTP_PROXY: JSON.stringify(process.env.HTTP_PROXY) },
      ...process.env.HTTPS_PROXY && { HTTPS_PROXY: JSON.stringify(process.env.HTTPS_PROXY) },
      ...process.env.NO_PROXY && { NO_PROXY: JSON.stringify(process.env.NO_PROXY) },
    };
    return Object.keys(environmentVariablesWithProxyAdditions).reduce((accumulator, currentValue) => `${accumulator} -e ${currentValue}=${environmentVariablesWithProxyAdditions[currentValue]}`, '');
  };

  const generateModuleMountsArgs = (modules) => {
    let args = '';
    if (modules && modules.length > 0) {
      args = modules.reduce((accumulator, currentValue) => {
        const moduleRootDir = path.basename(currentValue);
        return `${accumulator} -v ${currentValue}:/opt/module-workspace/${moduleRootDir}`;
      }, '');
    }

    return args;
  };

  const generateSetMiddlewareCommand = (pathToMiddlewareFile) => {
    if (pathToMiddlewareFile) {
      const pathArray = pathToMiddlewareFile.split(path.sep);
      return `npm run set-middleware /opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]} &&`;
    }
    return '';
  };

  const generateSetDevEndpointsCommand = (pathToDevEndpointsFile) => {
    if (pathToDevEndpointsFile) {
      const pathArray = pathToDevEndpointsFile.split(path.sep);
      return `npm run set-dev-endpoints /opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]} &&`;
    }
    return '';
  };

  const generateUseMocksFlag = (shouldUseMocks) => (shouldUseMocks ? '-m' : '');

  const generateServeModuleCommands = (modules) => {
    let command = '';
    if (modules && modules.length > 0) {
      modules.forEach((modulePath) => {
        const moduleRootDir = path.basename(modulePath);
        command += `npm run serve-module /opt/module-workspace/${moduleRootDir} &&`;
      });
    }
    return command;
  };

  const generateModuleMap = () => {
    return moduleMapUrl ? `--module-map-url=${moduleMapUrl}` : '';
      return `--module-map-url=${moduleMapUrl}`;
    }
    return '';
  };

  const command = `docker pull ${appDockerImage} && docker run -t -p 3000-3005:3000-3005 -e NODE_ENV=development ${generateEnvironmentVariableArgs(envVars)} ${generateModuleMountsArgs(modulesToServe)} ${appDockerImage} /bin/sh -c "${generateServeModuleCommands(modulesToServe)} ${generateSetMiddlewareCommand(parrotMiddlewareFile)} ${generateSetDevEndpointsCommand(devEndpointsFile)} node lib/server/index.js --root-module-name=${rootModuleName} ${generateModuleMap()} ${generateUseMocksFlag(parrotMiddlewareFile)}"`;
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
