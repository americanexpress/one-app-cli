const path = require('path');
const webpack = require('webpack');
const readPkgUp = require('read-pkg-up');
const chalk = require('chalk');
const { ConcatSource } = require('webpack-sources');
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const getRegisterExternalStr = require('../utils/getRegisterExternalStr');
const getExternalLibraryName = require('../utils/getExternalLibraryName');

function HolocronExternalRegisterPlugin(externalName, version) {
  this.externalName = externalName;
  this.externalVersion = version;
  this.options = {};
}

HolocronExternalRegisterPlugin.prototype.apply = function apply(compiler) {
  const { externalName, externalVersion, options } = this;
  compiler.hooks.compilation.tap('HolocronExternalRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('HolocronExternalRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        if (chunk.name !== 'main') return;
        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            // eslint-disable-next-line no-param-reassign -- this is a webpack mutation
            compilation.assets[file] = new ConcatSource(
              compilation.assets[file],
              '\n',
              getRegisterExternalStr(externalName, externalVersion),
              '\n'
            );
          });
      });

      callback();
    });
  });
};

module.exports = function bundleExternalFallbacks() {
  const { packageJson } = readPkgUp.sync();
  const { 'one-amex': { bundler = {} } } = packageJson;
  const { requiredExternals } = bundler;

  if (
    !requiredExternals || !Array.isArray(requiredExternals)
    || requiredExternals.length === 0
  ) {
    return;
  }

  requiredExternals.forEach((externalName) => {
    const indexPath = path.resolve(process.cwd(), `node_modules/${externalName}`);
    // eslint-disable-next-line global-require, import/no-dynamic-require -- need to require a package.json at runtime
    const { version } = require(`${externalName}/package.json`);

    webpack({
      entry: indexPath,
      output: {
        path: path.resolve(process.cwd(), `build/${packageJson.version}`),
        filename: `${externalName}.js`,
        library: `${getExternalLibraryName(externalName, version)}`,
      },
      plugins: [
        new HolocronExternalRegisterPlugin(externalName, version),
      ],
    }, (externalError) => {
      if (externalError) {
        console.log(`Failed to bundle external - ${externalName}`);
        console.log(chalk.red(externalError), chalk.red(externalError.stack));
        throw externalError;
      }
    });
  });
};
