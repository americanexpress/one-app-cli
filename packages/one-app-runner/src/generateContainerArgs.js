const path = require('node:path');

const semver = require('semver');

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

function generateSetMiddlewareCommand(pathToMiddlewareFile) {
  if (!pathToMiddlewareFile) {
    return '';
  }
  const pathArray = pathToMiddlewareFile.split(path.sep);
  return `npm run set-middleware '/opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]}' &&`;
}

function generateSetDevEndpointsCommand(pathToDevEndpointsFile) {
  if (!pathToDevEndpointsFile) {
    return '';
  }
  const pathArray = pathToDevEndpointsFile.split(path.sep);
  return `npm run set-dev-endpoints '/opt/module-workspace/${pathArray[pathArray.length - 2]}/${pathArray[pathArray.length - 1]}' &&`;
}

function generateUseMocksFlag(shouldUseMocks) { return shouldUseMocks ? '-m' : ''; }

function generateNpmConfigCommands() { return 'npm config set update-notifier false &&'; }

function generateServeModuleCommands(modules) {
  let command = '';
  if (modules && modules.length > 0) {
    modules.forEach((modulePath) => {
      const moduleRootDir = path.basename(modulePath);
      command += `npm run serve-module '/opt/module-workspace/${moduleRootDir}' &&`;
    });
  }
  return command;
}

function generateModuleMap(moduleMapUrl) { return moduleMapUrl ? `--module-map-url=${moduleMapUrl}` : ''; }

function generateLogLevel(logLevel) { return logLevel ? `--log-level=${logLevel}` : ''; }

function generateLogFormat(logFormat) { return logFormat ? `--log-format=${logFormat}` : ''; }

function generateDebug(port, useDebug) { return useDebug ? `--inspect=0.0.0.0:${port}` : ''; }

// NOTE: Node 12 does not support --dns-result-order or --no-experimental-fetch
// So we have to remove those flags if the one-app version is less than 5.13.0
// 5.13.0 is when node 16 was introduced.
function generateNodeFlags(appVersion) {
  if (semver.intersects(appVersion, '^5.13.0', { includePrerelease: true })) {
    return '--dns-result-order=ipv4first --no-experimental-fetch';
  }
  return '';
}

function generateUseHostFlag(useHost) { return useHost ? '--use-host' : ''; }

module.exports = {
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
  generateUseHostFlag,
};
