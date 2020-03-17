#!/usr/bin/env node

const path = require('path');
const pkgUp = require('pkg-up');
const startApp = require('../src/startApp');

const createYargsConfig = () => {
  const packageJsonPath = pkgUp.sync();
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const packageJson = require(packageJsonPath);

  const oneAppRunnerConfig = (packageJson['one-amex'] && packageJson['one-amex'].runner) || {};

  // eslint-disable-next-line global-require
  const yargs = require('yargs')
    .option('module-map-url', {
      type: 'string',
      demandOption: true,
      describe: 'module map for One App to use and fetch modules from',
      coerce: (value) => {
        if (!value) {
          throw new Error('⚠️   --module-map-url option must be given a value but was not given one. Did you mean to pass a value? ⚠️');
        }
        return value;
      },
    })
    .option('root-module-name', {
      type: 'string',
      demandOption: true,
      describe: 'name of the module to serve as an entry point to your application',
      coerce: (value) => {
        if (!value) {
          throw new Error('⚠️   --root-module-name option must be given a value but was not given one. Did you mean to pass a value? ⚠️');
        }
        return value;
      },
    })
    .option('docker-image', {
      type: 'string',
      describe: 'docker image to use for One App',
      demandOption: true,
      coerce: (value) => {
        if (!value) {
          throw new Error('⚠️   --docker-image option must be given a value but was not given one. Did you mean to pass a value? ⚠️');
        }
        return value;
      },
    })
    .option('parrot-middleware', {
      describe: 'path to parrot dev middleware file for One App to use for Parrot mocking',
      type: 'string',
      coerce: (value) => {
        if (!value) {
          return value;
        }
        return path.resolve(process.cwd(), value);
      },
    })
    .option('modules', {
      type: 'array',
      describe: 'path to local module to serve to One App',
      coerce: (modules) => {
        if (!modules.length > 0) {
          throw new Error('⚠️   --modules option must be given a value but was not given one. Did you mean to pass a value? ⚠️');
        }
        const processedModules = modules.map((module) => path.resolve(process.cwd(), module));
        return processedModules;
      },
    })
    .option('dev-endpoints', {
      describe: 'path to dev endpoints file for One App to use for its One App Dev Proxy set up',
      type: 'string',
      coerce: (value) => {
        if (!value) {
          throw new Error('⚠️   --dev-endpoints option must be given a value but was not given one. Did you mean to pass a value? ⚠️');
        }
        return path.resolve(process.cwd(), value);
      },
    })
    .option('envVars', {
      describe: 'Environment variables to be applied to the One App instance',
      coerce: (value) => {
        if (typeof value === 'object') {
          return value;
        }
        try {
          return JSON.parse(value);
        } catch (err) {
          throw new Error('⚠️   --envVars option failed to parse a value. Reference the Readme for valid configuration examples. ⚠️');
        }
      },
    })
    .option('output-file', {
      type: 'string',
      describe: 'File to redirect all stdout and stderr from One App Container to',
      coerce: (value) => path.resolve(process.cwd(), value),
    })
    .implies({
      'parrot-middleware': 'modules',
      'dev-endpoints': 'modules',
    })
    .strict()
    .help();

  if (Object.keys(oneAppRunnerConfig).length > 0) {
    yargs.config(oneAppRunnerConfig);
  }

  return yargs.argv;
};

const argv = createYargsConfig();

if (!argv.envVars) {
  argv.envVars = {};
}

try {
  startApp({
    moduleMapUrl: argv.moduleMapUrl,
    rootModuleName: argv.rootModuleName,
    modulesToServe: argv.modules,
    parrotMiddlewareFile: argv.parrotMiddleware,
    devEndpointsFile: argv.devEndpoints,
    appDockerImage: argv.dockerImage,
    envVars: argv.envVars,
    outputFile: argv.outputFile,
  });
} catch (error) {
  /* eslint-disable no-console */
  console.log();
  console.error('⚠️   Error starting up your One App environment: \n', error.message);
  /* eslint-enable no-console */
}
