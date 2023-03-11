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
    expect(sizeForHumans(buildReport[0].size)).toMatchInlineSnapshot('"23.3 KiB / 23.81 KB"');
    expect(sizeForHumans(buildReport[0].unpackedSize)).toMatchInlineSnapshot('"102.9 KiB / 105.38 KB"');
  });

  it('includes expected files', () => {
    expect(buildReport).toHaveProperty('0.files', expect.any(Array));
    expect(buildReport[0].files.map(({ path: filePath }) => filePath)).toMatchInlineSnapshot(`
Array [
  "CHANGELOG.md",
  "LICENSE.txt",
  "README.md",
  "bin/bundle-module.js",
  "bin/bundle-one-app.js",
  "bin/drop-module.js",
  "bin/generateIntegrityManifest.js",
  "bin/postProcessOneAppBundle.js",
  "bin/serve-module.js",
  "bin/webpack-bundle-module.js",
  "bin/webpackCallback.js",
  "index.js",
  "package.json",
  "utils/extendWebpackConfig.js",
  "utils/getCliOptions.js",
  "utils/getConfigOptions.js",
  "utils/validateNodeEnv.js",
  "utils/validation/index.js",
  "webpack/app/webpack.client.js",
  "webpack/createResolver.js",
  "webpack/loaders/common.js",
  "webpack/loaders/externals-loader.js",
  "webpack/loaders/meta-data-loader.js",
  "webpack/loaders/provided-externals-loader.js",
  "webpack/loaders/ssr-css-loader/css-base.js",
  "webpack/loaders/ssr-css-loader/index-style-loader.js",
  "webpack/loaders/ssr-css-loader/index.js",
  "webpack/loaders/validate-one-app-compatibility-loader.js",
  "webpack/loaders/validate-required-externals-loader.js",
  "webpack/module/webpack.client.js",
  "webpack/module/webpack.server.js",
  "webpack/webpack.common.js",
]
`);
  });
});
