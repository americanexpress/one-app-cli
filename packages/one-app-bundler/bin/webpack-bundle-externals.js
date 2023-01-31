const path = require('path');
const webpack = require('webpack');
const readPkgUp = require('read-pkg-up');
const chalk = require('chalk');
const { snakeCase } = require('lodash');
const { EXTERNAL_PREFIX } = require('..');

module.exports = function bundleExternals(label) {
  const { packageJson } = readPkgUp.sync();
  const { version } = packageJson;
  const { bundler } = packageJson['one-amex'];

  if (!bundler.sharedExternals || bundler.sharedExternals.length === 0) {
    return;
  }

  if (label === 'browser') {
    bundler.sharedExternals.forEach((external) => {
      webpack({
        entry: path.resolve(process.cwd(), `node_modules/${external}`),
        output: {
          // This makes the global variable name `__holocron_external_<package-name>`
          // eg. `__holocron_external_is_even`
          library: `${EXTERNAL_PREFIX}${snakeCase(external)}`,
          path: path.resolve(process.cwd(), `build/${version}`),
          filename: `${external}.browser.js`,
        },
      }, (externalError) => {
        if (externalError) {
          console.log(`Failed to bundle external - ${external} (browser)`);
          console.log(chalk.red(externalError), chalk.red(externalError.stack));
          throw externalError;
        }
      });
    });
  }
  if (label === 'node') {
    bundler.sharedExternals.forEach((external) => {
      webpack({
        entry: path.resolve(process.cwd(), `node_modules/${external}`),
        output: {
          path: path.resolve(process.cwd(), `build/${version}`),
          filename: `${external}.node.js`,
          libraryTarget: 'commonjs2',
        },
      }, (externalError) => {
        if (externalError) {
          console.log(`Failed to bundle external - ${external} (node)`);
          console.log(chalk.red(externalError), chalk.red(externalError.stack));
          throw externalError;
        }
      });
    });
  }
};
