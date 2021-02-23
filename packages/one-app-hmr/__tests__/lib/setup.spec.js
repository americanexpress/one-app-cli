/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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
import fs from 'fs';
import { loadOneAppStaticsFromDocker, setupStatics } from '../../lib/setup';

jest.mock('child_process', () => ({
  execSync: () => 'en-US',
  spawnSync: jest.fn(),
}));

describe('setupStatics', () => {
  const config = {
    oneAppSource: 'docker',
    dockerImage: 'dockerproxy.aexp.com/oneamex/one-app-dev:latest',
  };
  it(' setups statics', async () => {
    fs.readdirSync = jest.fn(() => 'latest');
    fs.readFileSync = jest.fn(() => 'script with removed eval');
    fs.writeFileSync = jest.fn(() => 'sample-module/static/app/app.js');
    const setupStaticsValue = await setupStatics(config);
    console.log(setupStaticsValue);
  });
});
