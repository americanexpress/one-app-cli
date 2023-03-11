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
    expect(sizeForHumans(buildReport[0].size)).toMatchInlineSnapshot('"12.5 KiB / 12.83 KB"');
    expect(sizeForHumans(buildReport[0].unpackedSize)).toMatchInlineSnapshot('"46.7 KiB / 47.80 KB"');
  });

  it('includes expected files', () => {
    expect(buildReport).toHaveProperty('0.files', expect.any(Array));
    expect(buildReport[0].files.map(({ path: filePath }) => filePath)).toMatchInlineSnapshot(`
Array [
  "LICENSE.txt",
  "README.md",
  "generators/app/index.js",
  "generators/app/promptValidations.js",
  "generators/app/templates/base-child-module/__tests__/.eslintrc.json",
  "generators/app/templates/base-child-module/__tests__/components/ModuleContainer.spec.jsx",
  "generators/app/templates/base-child-module/__tests__/index.spec.js",
  "generators/app/templates/base-child-module/.babelrc",
  "generators/app/templates/base-child-module/.eslintrc.json",
  "generators/app/templates/base-child-module/dev.middleware.js",
  "generators/app/templates/base-child-module/gitignore",
  "generators/app/templates/base-child-module/mock/scenarios.js",
  "generators/app/templates/base-child-module/package.json",
  "generators/app/templates/base-child-module/README.md",
  "generators/app/templates/base-child-module/src/components/ModuleContainer.jsx",
  "generators/app/templates/base-child-module/src/index.js",
  "generators/app/templates/intl-child-module/__tests__/components/ModuleContainer.spec.jsx",
  "generators/app/templates/intl-child-module/__tests__/locale.spec.js",
  "generators/app/templates/intl-child-module/locale/en-CA.json",
  "generators/app/templates/intl-child-module/locale/en-US.json",
  "generators/app/templates/intl-child-module/locale/es-MX.json",
  "generators/app/templates/intl-child-module/src/components/ModuleContainer.jsx",
  "generators/app/templates/intl-child-module/test-setup.js",
  "generators/app/templates/intl-root-module/__tests__/components/ModuleContainer.spec.jsx",
  "generators/app/templates/intl-root-module/src/components/ModuleContainer.jsx",
  "generators/app/templates/root-module/__tests__/appConfig.spec.js",
  "generators/app/templates/root-module/__tests__/components/ModuleContainer.spec.jsx",
  "generators/app/templates/root-module/src/appConfig.js",
  "generators/app/templates/root-module/src/childRoutes.jsx",
  "generators/app/templates/root-module/src/components/ModuleContainer.jsx",
  "generators/app/templates/root-module/src/csp.js",
  "package.json",
]
`);
  });
});
