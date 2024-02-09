/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const ssri = require('ssri');
const fs = require('node:fs');
const path = require('node:path');

const generateIntegrityManifest = (label, pathToBundle) => {
  const integrity = ssri.fromData(
    fs.readFileSync(pathToBundle, 'utf8'),
    { algorithms: ['sha256', 'sha384'] }
  ).toString();

  const pathToFinalIntegrityManifest = path.join(process.cwd(), 'bundle.integrity.manifest.json');
  fs.writeFileSync(pathToFinalIntegrityManifest, JSON.stringify({
    // not using require to avoid require cache messing with things
    ...fs.existsSync(pathToFinalIntegrityManifest) ? JSON.parse(fs.readFileSync(pathToFinalIntegrityManifest, 'utf8')) : {},
    [label]: integrity,
  }, null, 2));
};

module.exports = generateIntegrityManifest;
