/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

/* eslint-disable import/no-dynamic-require, global-require --
we need to load generated assets at runtime */

const path = require('node:path');
const fs = require('node:fs');
const { hashElement } = require('folder-hash');
const readPkgUp = require('read-pkg-up');
const generateIntegrityManifest = require('./generateIntegrityManifest');

const { packageJson, path: pkgPath } = readPkgUp.sync();
const { version } = packageJson;
const tmpPath = path.resolve(pkgPath, '../build/app/tmp');

module.exports = async function postProcessBuild() {
  const endsWithJS = (fileName) => fileName.endsWith('.js');
  const legacyPath = path.join(tmpPath, 'legacy');
  const jsFileNames = fs.readdirSync(tmpPath).filter(endsWithJS);
  const legacyJsFileNames = fs.readdirSync(legacyPath).filter(endsWithJS);
  const addIntegrityToManifest = (pathName, prefix = '') => (fileName) => generateIntegrityManifest(prefix + fileName, path.join(pathName, fileName));
  jsFileNames.forEach(addIntegrityToManifest(tmpPath));
  legacyJsFileNames.forEach(addIntegrityToManifest(legacyPath, 'legacy/'));
  const options = {
    files: { include: ['*.js'] },
    encoding: 'hex',
  };
  const { hash } = await hashElement(tmpPath, options);
  const buildVersion = `${version}-${hash.slice(0, 8)}`;
  const modernBrowserChunkAssets = require(path.resolve(pkgPath, '../.webpack-stats.browser.json')).assetsByChunkName;
  const legacyBrowserChunkAssets = require(path.resolve(pkgPath, '../.webpack-stats.legacyBrowser.json')).assetsByChunkName;

  fs.renameSync(tmpPath, path.resolve(tmpPath, `../${buildVersion}`));
  const metaFilePath = path.resolve(pkgPath, '../.build-meta.json');
  if (fs.existsSync(metaFilePath)) fs.unlinkSync(metaFilePath);
  fs.writeFileSync(
    metaFilePath,
    JSON.stringify(
      { buildVersion, modernBrowserChunkAssets, legacyBrowserChunkAssets },
      undefined,
      2
    )
  );
};

/* eslint-enable import/no-dynamic-require, global-require -- disables require enables */
