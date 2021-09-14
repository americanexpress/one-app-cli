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

/* eslint-disable import/no-dynamic-require, global-require */

const path = require('path');
const fs = require('fs');
const { hashElement } = require('folder-hash');
const readPkgUp = require('read-pkg-up');

const getConfigOptions = require('../utils/getConfigOptions');
const generateIntegrityManifest = require('./generateIntegrityManifest');

const { packageJson, path: pkgPath } = readPkgUp.sync();
const { version } = packageJson;
const tmpPath = path.resolve(pkgPath, '../build/app/tmp');

module.exports = async function postProcessBuild() {
  const endsWithJS = (fileName) => fileName.endsWith('.js');
  const configOptions = getConfigOptions();
  const disableLegacy = !configOptions.disableLegacy && process.env.NODE_ENV === 'development';
  let legacyPath;
  let legacyJsFileNames;

  if (disableLegacy) {
    legacyPath = path.join(tmpPath, 'legacy');
    legacyJsFileNames = fs.readdirSync(legacyPath).filter(endsWithJS);
  }

  const jsFileNames = fs.readdirSync(tmpPath).filter(endsWithJS);
  const addIntegrityToManifest = (pathName, prefix = '') => (fileName) => generateIntegrityManifest(prefix + fileName, path.join(pathName, fileName));
  jsFileNames.forEach(addIntegrityToManifest(tmpPath));

  if (disableLegacy) legacyJsFileNames.forEach(addIntegrityToManifest(legacyPath, 'legacy/'));

  const options = {
    files: { include: ['*.js'] },
    encoding: 'hex',
  };
  const { hash } = await hashElement(tmpPath, options);
  const buildVersion = `${version}-${hash.substring(0, 8)}`;
  const modernBrowserChunkAssets = require(path.resolve(pkgPath, '../.webpack-stats.browser.json')).assetsByChunkName;
  const legacyBrowserChunkAssets = require(path.resolve(pkgPath, '../.webpack-stats.legacyBrowser.json')).assetsByChunkName;

  fs.renameSync(tmpPath, path.resolve(tmpPath, `../${buildVersion}`));
  const metaFilePath = path.resolve(pkgPath, '../.build-meta.json');
  if (fs.existsSync(metaFilePath)) fs.unlinkSync(metaFilePath);

  const assets = { buildVersion, modernBrowserChunkAssets };
  fs.writeFileSync(
    metaFilePath,
    JSON.stringify(
      disableLegacy ? { ...assets, legacyBrowserChunkAssets } : assets,
      undefined,
      2
    )
  );
};
