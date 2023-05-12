const path = require('path');
const { promisify } = require('util');
const webpack = promisify(require('webpack'));
const readPkgUp = require('read-pkg-up');
const chalk = require('chalk');
const { ConcatSource } = require('webpack-sources');
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const getRegisterExternalStr = require('../utils/getRegisterExternalStr');
const getExternalLibraryName = require('../utils/getExternalLibraryName');
const getExternalFilename = require('../utils/getExternalFilename');
const generateIntegrityManifest = require('./generateIntegrityManifest');

const nodeEnvironmentIsProduction = process.env.NODE_ENV === 'production';

function HolocronExternalRegisterPlugin(externalName, version) {
  this.externalName = externalName;
  this.externalVersion = version;
  this.options = {};
}

const {
  babelLoader,
} = require('../webpack/loaders/common');

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

module.exports = async function bundleExternalFallbacks() {
  const { packageJson } = readPkgUp.sync();
  const { 'one-amex': { bundler = {} } } = packageJson;
  const { requiredExternals } = bundler;

  if (
    !requiredExternals || !Array.isArray(requiredExternals)
    || requiredExternals.length === 0
  ) {
    return;
  }

  await Promise.all(requiredExternals.map((externalName) => {
    const indexPath = path.resolve(process.cwd(), `node_modules/${externalName}`);
    // eslint-disable-next-line global-require, import/no-dynamic-require -- need to require a package.json at runtime
    const { version } = require(`${externalName}/package.json`);
    const buildPath = path.resolve(process.cwd(), `build/${packageJson.version}`);

    return webpack({
      entry: indexPath,
      output: {
        path: buildPath,
        filename: getExternalFilename(externalName),
        library: getExternalLibraryName(externalName, version),
      },
      mode: nodeEnvironmentIsProduction ? 'production' : 'development',
      devtool: nodeEnvironmentIsProduction ? false : 'source-map',
      plugins: [
        new HolocronExternalRegisterPlugin(externalName, version),
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            use: [babelLoader('modern')],
          },
        ],
      },
    }).then(() => {
      generateIntegrityManifest(
        externalName,
        path.resolve(buildPath, getExternalFilename(externalName))
      );
    }).catch((externalError) => {
      console.log(`Failed to bundle external - ${externalName}`);
      console.log(chalk.red(externalError), chalk.red(externalError.stack));
      throw externalError;
    });
  }));
};
