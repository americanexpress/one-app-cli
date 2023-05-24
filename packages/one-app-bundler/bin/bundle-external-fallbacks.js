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
      externals: {
        '@americanexpress/one-app-router': {
          var: 'OneAppRouter',
          commonjs2: '@americanexpress/one-app-router',
        },
        'create-shared-react-context': {
          var: 'CreateSharedReactContext',
          commonjs2: 'create-shared-react-context',
        },
        holocron: {
          var: 'Holocron',
          commonjs2: 'holocron',
        },
        react: {
          var: 'React',
          commonjs2: 'react',
        },
        'react-dom': {
          var: 'ReactDOM',
          commonjs2: 'react-dom',
        },
        redux: {
          var: 'Redux',
          commonjs2: 'redux',
        },
        'react-redux': {
          var: 'ReactRedux',
          commonjs2: 'react-redux',
        },
        reselect: {
          var: 'Reselect',
          commonjs2: 'reselect',
        },
        immutable: {
          var: 'Immutable',
          commonjs2: 'immutable',
        },
        '@americanexpress/one-app-ducks': {
          var: 'OneAppDucks',
          commonjs2: '@americanexpress/one-app-ducks',
        },
        'holocron-module-route': {
          var: 'HolocronModuleRoute',
          commonjs2: 'holocron-module-route',
        },
        'prop-types': {
          var: 'PropTypes',
          commonjs2: 'prop-types',
        },
        'react-helmet': {
          var: 'ReactHelmet',
          commonjs2: 'react-helmet',
        },
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
