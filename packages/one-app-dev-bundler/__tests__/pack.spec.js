import path from 'node:path';
import { spawnSync } from 'node:child_process';

function sizeForHumans(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < (1024 * 1024)) {
    return `${(bytes / 1024).toFixed(1)} KiB / ${(bytes / 1000).toFixed(2)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB / ${(bytes / 1000 / 1000).toFixed(2)} MB`;
}

describe('publish artifact', () => {
  let buildReport;

  beforeAll(async () => {
    const execution = spawnSync('npm', ['pack', '--json'], { cwd: path.resolve(__dirname) });
    if (execution.error) {
      throw execution.error;
    }
    buildReport = JSON.parse(execution.stdout);
  });

  it('is a known size', () => {
    expect(buildReport).toHaveProperty('0.size', expect.any(Number));
    expect(buildReport).toHaveProperty('0.unpackedSize', expect.any(Number));
    expect(sizeForHumans(buildReport[0].size)).toMatchInlineSnapshot('"20.9 KiB / 21.38 KB"');
    expect(sizeForHumans(buildReport[0].unpackedSize)).toMatchInlineSnapshot('"87.0 KiB / 89.05 KB"');
  });

  it('includes expected files', () => {
    expect(buildReport).toHaveProperty('0.files', expect.any(Array));
    expect(buildReport[0].files.map(({ path: filePath }) => filePath)).toMatchInlineSnapshot(`
Array [
  "CHANGELOG.md",
  "LICENSE.txt",
  "README.md",
  "bin/bundle-analysis.js",
  "esbuild/constants/enums.js",
  "esbuild/constants/one-app-externals.js",
  "esbuild/generateESBuildOptions.js",
  "esbuild/plugins/bundle-asset-size-limiter.js",
  "esbuild/plugins/cjs-compatibility-hotpatch.js",
  "esbuild/plugins/externals-loader.js",
  "esbuild/plugins/font-loader.js",
  "esbuild/plugins/generate-integrity-manifest.js",
  "esbuild/plugins/image-loader.js",
  "esbuild/plugins/legacy-bundler.js",
  "esbuild/plugins/one-app-index-loader-injectors/app-compatibility-injector.js",
  "esbuild/plugins/one-app-index-loader-injectors/dev-live-reloader-injector.js",
  "esbuild/plugins/one-app-index-loader-injectors/holocron-module-register-injector.js",
  "esbuild/plugins/one-app-index-loader-injectors/module-metadata-injector.js",
  "esbuild/plugins/one-app-index-loader-injectors/provided-externals-injector.js",
  "esbuild/plugins/one-app-index-loader.js",
  "esbuild/plugins/prevent-prod-builds-for-now.js",
  "esbuild/plugins/remove-webpack-loader-syntax.js",
  "esbuild/plugins/restrict-runtime-symbols.js",
  "esbuild/plugins/server-styles-dispatcher.js",
  "esbuild/plugins/styles-loader.js",
  "esbuild/plugins/time-build.js",
  "esbuild/utils/colorful-logging.js",
  "esbuild/utils/get-app-compatibility.js",
  "esbuild/utils/get-js-filenames-from-keys.js",
  "esbuild/utils/get-meta-url.mjs",
  "esbuild/utils/get-modules-bundler-config.js",
  "esbuild/utils/get-modules-webpack-config.js",
  "esbuild/utils/purgecss.js",
  "esbuild/utils/server-style-aggregator.js",
  "esbuild/watch-server/watch-server.js",
  "index.js",
  "package.json",
  "utils/analyze-bundles.js",
  "utils/dev-build-module.js",
  "utils/get-cli-options.js",
]
`);
  });
});
