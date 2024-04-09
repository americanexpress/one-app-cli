import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers.js';

export function ExternalRegisterPlugin(externalName, version, module) {
  this.externalName = externalName;
  this.version = version;
  this.module = module;
  this.options = {};
}

ExternalRegisterPlugin.prototype.apply = function apply(compiler) {
  const {
    externalName,
    version,
    module,
    options,
  } = this;

  compiler.hooks.compilation.tap('ExternalRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('ExternalRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        if (chunk.name !== 'main') return;

        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            const source = compilation.assets[file];
            // descend into the source and inject the registration within the iife
            // The last two symbols are always the closing of the iife, then a `;`
            // Therefore, insert the registration immediately before the iife closes
            // eslint-disable-next-line no-underscore-dangle -- webpack
            source._source._children.splice(-2, 0, `;try {
    Holocron.registerExternal({ name: "${externalName}", version: "${version}", module: ${module}});
} catch (err) {
    console.error('ERROR Registring External "${externalName}"', err)
}`);
          });
      });

      callback();
    });
  });
};
