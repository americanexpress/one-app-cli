const path = require('path');
const webpack = require('webpack');
const readPkgUp = require('read-pkg-up');
const chalk = require('chalk');
const { snakeCase } = require('lodash');
const { ConcatSource } = require('webpack-sources');
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const { EXTERNAL_PREFIX } = require('..');
function HolocronModuleRegisterPlugin(externalName) {
  this.externalName = externalName;
  this.options = {};
}

HolocronModuleRegisterPlugin.prototype.apply = function apply(compiler) {
  const { externalName, options } = this;
  compiler.hooks.compilation.tap('HolocronModuleRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('HolocronModuleRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        if (chunk.name !== 'main') return;
        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            // eslint-disable-next-line no-param-reassign
            compilation.assets[file] = new ConcatSource(
              '(function() {',
              '\n',
              compilation.assets[file],
              '\n',
              `Holocron.registerExternal("${externalName}");})();`
            );
          });
      });

      callback();
    });
  });
};

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

  if (!['browser', 'node'].includes(runtimeEnv)) {
    throw new Error(`Invalid runtimeEnv "${runtimeEnv}"`);
  }

  requiredExternals.forEach((externalName) => {
    const indexPath = path.resolve(process.cwd(), `node_modules/${externalName}`);

    webpack({
      entry: indexPath,
      output: {
        path: path.resolve(process.cwd(), `build/${version}`),
        filename: `${externalName}.${runtimeEnv}.js`,
        ...runtimeEnv === 'browser' ? {
          library: `${EXTERNAL_PREFIX}${snakeCase(externalName)}`,
        } : {
          libraryTarget: 'commonjs2',
        },
      },
      plugins: [
        new HolocronModuleRegisterPlugin(externalName),
      ],
    }, (externalError) => {
      if (externalError) {
        console.log(`Failed to bundle external - ${externalName} (runtimeEnv)`);
        console.log(chalk.red(externalError), chalk.red(externalError.stack));
        throw externalError;
      }
    });
  });
};
