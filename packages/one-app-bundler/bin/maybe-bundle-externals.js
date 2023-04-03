const path = require('path');
const webpack = require('webpack');
const readPkgUp = require('read-pkg-up');
const chalk = require('chalk');
const { snakeCase } = require('lodash');
const { EXTERNAL_PREFIX } = require('..');

module.exports = function maybeBundleExternals(runtimeEnv) {
  const { packageJson } = readPkgUp.sync();
  const { version, 'one-amex': { bundler } } = packageJson;
  const { requiredExternals } = bundler;

  if (
    !requiredExternals || !Array.isArray(requiredExternals)
    || requiredExternals.length === 0
  ) {
    return;
  }

  if (!(runtimeEnv in ['browser', 'node'])) {
    throw new Error(`Invalid runtimeEnv "${runtimeEnv}"`);
  }

  requiredExternals.forEach((external) => {
    webpack({
      entry: path.resolve(process.cwd(), `node_modules/${external}`),
      output: {
        path: path.resolve(process.cwd(), `build/${version}`),
        filename: `${external}.${runtimeEnv}.js`,
        ...runtimeEnv === 'browser' ? {
          library: `${EXTERNAL_PREFIX}${snakeCase(external)}`,
        } : {
          libraryTarget: 'commonjs2',
        },
      },
    }, (externalError) => {
      console.log(`Failed to bundle external - ${external} (runtimeEnv)`);
      console.log(chalk.red(externalError), chalk.red(externalError.stack));
      throw externalError;
    });
  });
};
