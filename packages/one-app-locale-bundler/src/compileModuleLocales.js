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

/*
  copy language files into dist
  expect:

  - [locale] (dir or JSON file)
    - copy.json
    - [key]
      - integration.json
      - qa.json
      - production.json

  to be backwards-compatible, [locale] can be [locale].json (no environment comprehension)
  any directories under the [locale] dir will be merged into copy.json under a root-level key of the
  directory name (here, [key])

  [locale] should be BCP-47 compliant
*/

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const glob = promisify(require('glob'));
const rimraf = promisify(require('rimraf'));
const promisifiedFs = require('./promisified-fs');
const mkdirp = require('./mkdirp');

function compileModuleLocales(modulePath) {
  const pkg = JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json')));
  const { version, name } = pkg;
  const builtLocaleDir = path.join(modulePath, `build/${version}`);

  function writeLocaleFile({
    moduleName,
    localeName,
    localeData,
    otherData,
    fileName,
  }) {
    const outputLocaleDir = path.join(builtLocaleDir, localeName.toLowerCase());
    const outputLocaleFile = path.join(outputLocaleDir, `${fileName || moduleName}.json`);

    return mkdirp(outputLocaleDir)
      .then(() => ({
        // some default/boilerplate values
        locale: localeName,
        ...localeData,
        ...otherData,
      }))
      .then((localeDataJS) => JSON.stringify(localeDataJS))
      .then((localeContents) => promisifiedFs.writeFile(outputLocaleFile, localeContents));
  }

  function buildModuleLocaleFilesFromFile(moduleName, localeName, localePath) {
    return promisifiedFs.readFile(localePath)
      .then((localeContents) => JSON.parse(localeContents))
      .then((localeData) => Promise.all([
        writeLocaleFile({
          moduleName,
          localeName,
          localeData,
          fileName: 'integration',
        }),
        writeLocaleFile({
          moduleName,
          localeName,
          localeData,
          fileName: 'qa',
        }),
        writeLocaleFile({ moduleName, localeName, localeData }),
      ]));
  }

  function buildModuleLocaleFilesFromDir(moduleName, localeName, localePath) {
    return Promise.all(
      [
        // grab the base data
        promisifiedFs.readFile(path.join(localePath, 'copy.json'))
          .then((localeContents) => JSON.parse(localeContents)),
      ].concat(
        // find all of the env-specific data (ex: links)
        [
          'integration',
          'qa',
          'production',
        ]
          .map((env) => glob(`!(copy.json)/${env}.json`, { cwd: localePath })
            .then((list) => Promise.all(list.map((envPropPath) => new Promise((res, rej) => {
              const key = path.parse(envPropPath).dir;
              promisifiedFs
                .readFile(path.join(localePath, envPropPath))
                .then((propContents) => JSON.parse(propContents))
                .then((data) => res({ key, data }))
                .catch(rej);
            }))))
            .then((listOfProps) => {
              const otherData = {};
              listOfProps.forEach((propInfo) => {
                otherData[propInfo.key] = propInfo.data;
              });
              return otherData;
            })
          )
      )
    )
      .then((v) => {
        const localeData = v[0];
        const integrationData = v[1];
        const qaData = v[2];
        const productionData = v[3];
        return Promise.all([
          writeLocaleFile({
            moduleName,
            localeName,
            localeData,
            otherData: integrationData,
            fileName: 'integration',
          }),
          writeLocaleFile({
            moduleName,
            localeName,
            localeData,
            otherData: qaData,
            fileName: 'qa',
          }),
          writeLocaleFile({
            moduleName,
            localeName,
            localeData,
            otherData: productionData,
          }),
        ]);
      });
  }

  function buildModuleLocaleFiles(moduleName, localeName, localePath) {
    return promisifiedFs.lstat(localePath)
      .then((localeStat) => {
        if (localeStat.isDirectory()) {
          return buildModuleLocaleFilesFromDir(moduleName, localeName, localePath);
        }

        return buildModuleLocaleFilesFromFile(moduleName, localeName, localePath);
      });
  }

  function buildModuleFiles(moduleName) {
    const moduleLocaleInputDir = path.join(modulePath, 'locale');
    return glob('*', { cwd: moduleLocaleInputDir })
      .then((moduleLocals) => Promise.all(
        moduleLocals.map((moduleLocal) => buildModuleLocaleFiles(
          moduleName,
          path.parse(moduleLocal).name,
          path.join(moduleLocaleInputDir, moduleLocal)
        ))
      ).then(() => {
        if (moduleLocals.length !== 0) {
          console.log(`Generated language packs for ${moduleLocals.map((fileName) => fileName.replace(/\.json$/, '')).join(', ')}`);
        } else {
          console.log('Generated 0 language packs.');
        }
      }));
  }

  function areArraysEqual(arr1, arr2) {
    return arr1.length === arr2.length
      ? arr1.every((item, index) => item === arr2[index])
      : false;
  }

  async function removeLocaleDirs() {
    const builtLocaleDirContents = await promisifiedFs.readdir(builtLocaleDir);
    return Promise.all(builtLocaleDirContents.map(async (fileOrDirName) => {
      try {
        const dirPath = path.join(builtLocaleDir, fileOrDirName);
        const dirContents = await promisifiedFs.readdir(dirPath);
        const contentsForLocaleDir = [`${name}.json`, 'integration.json', 'qa.json'].sort();
        if (areArraysEqual(dirContents.sort(), contentsForLocaleDir)) {
          return rimraf(dirPath);
        }
      } catch (err) { /* swallow */ }

      return null;
    }));
  }

  return Promise.resolve()
    .then(() => mkdirp(builtLocaleDir))
    .then(removeLocaleDirs)
    .then(() => buildModuleFiles(name));
}

module.exports = compileModuleLocales;
