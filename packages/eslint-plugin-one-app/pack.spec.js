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
    expect(sizeForHumans(buildReport[0].size)).toMatchInlineSnapshot('"7.3 KiB / 7.43 KB"');
    expect(sizeForHumans(buildReport[0].unpackedSize)).toMatchInlineSnapshot('"22.7 KiB / 23.20 KB"');
  });

  it('includes expected files', () => {
    expect(buildReport).toHaveProperty('0.files', expect.any(Array));
    expect(buildReport[0].files.map(({ path: filePath }) => filePath)).toMatchInlineSnapshot(`
Array [
  "CHANGELOG.md",
  "LICENSE.txt",
  "README.md",
  "index.js",
  "package.json",
  "rules/no-app-config-on-client.docs.md",
  "rules/no-app-config-on-client.js",
  "rules/no-app-config-on-client.test.js",
]
`);
  });
});