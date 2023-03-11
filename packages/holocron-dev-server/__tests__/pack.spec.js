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
    expect(sizeForHumans(buildReport[0].size)).toMatchInlineSnapshot('"23.4 KiB / 24.00 KB"');
    expect(sizeForHumans(buildReport[0].unpackedSize)).toMatchInlineSnapshot('"98.0 KiB / 100.35 KB"');
  });

  it('includes expected files', () => {
    expect(buildReport).toHaveProperty('0.files', expect.any(Array));
    expect(buildReport[0].files.map(({ path: filePath }) => filePath)).toMatchInlineSnapshot(`
Array [
  "LICENSE.txt",
  "README.md",
  "bin/holocron-dev-server.js",
  "index.js",
  "package.json",
  "src/components/Document.jsx",
  "src/components/HolocronHmrWrapper.jsx",
  "src/components/hooks/useHotMiddlewareSubscriber.js",
  "src/constants.js",
  "src/index.js",
  "src/middleware/html.js",
  "src/middleware/parrot-scenarios.js",
  "src/middleware/proxy-relay.js",
  "src/middleware/request-accepted.js",
  "src/middleware/webpack.js",
  "src/server.js",
  "src/utils/config.js",
  "src/utils/helpers.js",
  "src/utils/language-packs.js",
  "src/utils/logs/index.js",
  "src/utils/logs/logs.js",
  "src/utils/logs/messages.js",
  "src/utils/module-map.js",
  "src/utils/paths.js",
  "src/utils/publish.js",
  "src/utils/rendering.js",
  "src/utils/statics.js",
  "src/utils/virtual-file-system.js",
  "src/utils/watcher.js",
  "src/webpack/configs/bundles.js",
  "src/webpack/configs/fragments.js",
  "src/webpack/configs/loaders.js",
  "src/webpack/createHotHolocronCompiler.js",
  "src/webpack/helpers.js",
  "src/webpack/loaders/holocron-webpack-loader.js",
]
`);
  });
});
