/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const execa = require('execa');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const cli = require('..');

const run = (args, options) => execa('node', [cli].concat(args), options);

async function usingTempDir(fn, options) {
  const folder = path.join(os.tmpdir(), Math.random().toString(36).substring(2));
  await fs.mkdirp(folder, options);
  try {
    return await fn(folder);
  } finally {
    await fs.remove(folder);
  }
}

describe('create one app module', () => {
  it('non-empty directory', async () => {
    await usingTempDir(async (cwd) => {
      const projectName = 'non-empty-directory';
      await fs.mkdirp(path.join(cwd, projectName));
      const pkg = path.join(cwd, projectName, 'package.json');
      fs.writeFileSync(pkg, '{ "foo": "bar" }');

      const res = await run([projectName], { cwd, reject: false });
      expect(res.exitCode).toBe(1);
    });
  });

  it('valid example', async () => {
    await usingTempDir(async (cwd) => {
      const projectName = 'valid-example';
      const res = await run([projectName, '--example', 'basic-css'], { cwd });
      expect(res.exitCode).toBe(0);

      expect(
        fs.existsSync(path.join(cwd, projectName, 'package.json'))
      ).toBeTruthy();
      expect(
        fs.existsSync(path.join(cwd, projectName, 'pages/index.js'))
      ).toBeTruthy();
      // check we copied default `.gitignore`
      expect(
        fs.existsSync(path.join(cwd, projectName, '.gitignore'))
      ).toBeTruthy();
    });
  });
});
