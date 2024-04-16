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

import fs from 'node:fs';
import path from 'node:path';
import { readPackageUpSync } from 'read-package-up';

export function writeToModuleConfig(newData) {
  const { packageJson } = readPackageUpSync();
  const configPath = path.resolve(process.cwd(), 'build', packageJson.version, 'module-config.json');
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};

  fs.writeFileSync(configPath, JSON.stringify({
    ...config,
    ...newData,
  }));
}
