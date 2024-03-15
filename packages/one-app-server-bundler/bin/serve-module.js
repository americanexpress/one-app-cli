#! /usr/bin/env node
/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

const fs = require('node:fs');
const util = require('node:util');
const path = require('node:path');

const publicPath = path.join(process.cwd(), 'static');
const symModulesPath = path.join(publicPath, 'modules');

fs.mkdirSync(symModulesPath, { recursive: true });

util.parseArgs({ allowPositionals: true }).positionals.forEach((modulePath) => {
  const pkg = JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json')));
  const absoluteModulePath = modulePath.startsWith('/')
    ? modulePath : path.join(process.cwd(), modulePath);
  const {
    browser: browserSri,
    legacyBrowser: legacyBrowserSri,
    node: nodeSri,
  } = JSON.parse(fs.readFileSync(path.join(modulePath, 'bundle.integrity.manifest.json')));
  const { version, name: moduleName } = pkg;

  if (!version) {
    throw new Error(`No versioned bundles exist for module ${moduleName}`);
  }

  // enforce only one version of a module being served at once
  fs.rmSync(path.join(symModulesPath, moduleName), { recursive: true, force: true });
  fs.mkdirSync(path.join(symModulesPath, moduleName), { recursive: true });

  const sourceBundlePath = path.join(absoluteModulePath, 'build', version);
  const symBundlePath = path.join(symModulesPath, moduleName, version);

  try {
    fs.accessSync(symBundlePath);
    fs.unlinkSync(symBundlePath);
  } catch (e) {
    // Do nothing, file does not exist, so it does not need to be deleted
  } finally {
    /*
     * Cant symlink on windows without admin, windows uses junctions
     * we only symlink dir so file type not needed
     */
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    fs.symlinkSync(sourceBundlePath, symBundlePath, type);
  }

  const moduleMapPath = path.join(publicPath, 'module-map.json');
  try {
    fs.accessSync(moduleMapPath);
  } catch (e) {
    fs.writeFileSync(moduleMapPath, JSON.stringify({ key: 'not-used-in-development', modules: {} }, null, 2));
  } finally {
    const moduleMap = JSON.parse(fs.readFileSync(moduleMapPath));
    const generalConfig = {
      browser: {
        integrity: browserSri,
        url: `[one-app-dev-cdn-url]/static/modules/${moduleName}/${version}/${moduleName}.browser.js`,
      },
      node: {
        integrity: nodeSri,
        url: `[one-app-dev-cdn-url]/static/modules/${moduleName}/${version}/${moduleName}.node.js`,
      },
    };

    const legacyConfig = legacyBrowserSri ? {
      legacyBrowser: {
        integrity: legacyBrowserSri,
        url: `[one-app-dev-cdn-url]/static/modules/${moduleName}/${version}/${moduleName}.legacy.browser.js`,
      },
    } : {};

    moduleMap.modules[moduleName] = { ...generalConfig, ...legacyConfig };

    fs.writeFileSync(moduleMapPath, JSON.stringify(moduleMap, null, 2));
  }
});
