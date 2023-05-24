import path from 'path';
import { readPackageUpSync } from 'read-pkg-up';
import esbuild from 'esbuild';
import snakeCase from 'lodash.snakecase';
import generateESBuildOptions from '../esbuild/generateESBuildOptions.js';
import generateIntegrityManifest from './generate-integrity-manifest.js';

const EXTERNAL_PREFIX = '__holocron_external';

const { packageJson } = readPackageUpSync() || {};
const { 'one-amex': { bundler = {} } } = packageJson;
const { requiredExternals } = bundler;

const getExternalLibraryName = (name, version) => [EXTERNAL_PREFIX, snakeCase(name), version.replace(/[^\d.]+/g, '').replace(/\.+/g, '_')].filter(Boolean).join('__');

/**
 * Transpiles Requires Externals as individual files.
 * It's completely independent from bundling module's code.
 */
export const bundleExternalFallbacks = async () => {
  if (
    requiredExternals && Array.isArray(requiredExternals)
    && requiredExternals.length > 0
  ) {
    const {
      commonConfig,
      browserConfig,
    } = await generateESBuildOptions({ watch: false, useLiveReload: false });

    const config = {
      ...browserConfig,
      plugins: [
        ...commonConfig.plugins,
      ],
    };

    await Promise.all(requiredExternals.map((externalName) => {
      const indexPath = path.resolve(process.cwd(), `node_modules/${externalName}`);
      const buildPath = path.resolve(process.cwd(), `build/${packageJson.version}`);
      const externalFilename = `${externalName}.js`;
      const outfile = path.resolve(buildPath, externalFilename);
      const version = readPackageUpSync({
        cwd: path.resolve(process.cwd(), 'node_modules', externalName),
      })?.packageJson.version;

      return esbuild.build({
        ...config,
        entryPoints: [indexPath],
        outfile,
        globalName: getExternalLibraryName(externalName, version),
      }).then(() => {
        generateIntegrityManifest(
          externalName,
          outfile
        );
      });
    }));
  }
};

export default bundleExternalFallbacks;
