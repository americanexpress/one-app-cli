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

const path = require('path');
const fs = require('fs');
const generateIntegrityManifest = require('../../utils/generateIntegrityManifest');

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('{}')),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));
jest.mock('ssri', () => ({
  fromData: jest.fn(() => Buffer.from('integrity-hash')),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generateIntegrityManifest', () => {
  it('should write the integrity manifest after generating', async () => {
    const generateIntegrityManifestTakenToRun = await generateIntegrityManifest('server', '/');
    expect(generateIntegrityManifestTakenToRun).toBe(undefined);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), 'bundle.integrity.manifest.json'),
      JSON.stringify({ server: 'integrity-hash' }, null, 2)
    );
  });

  it('should update the integrity manifests per bundle if already exists', async () => {
    fs.existsSync.mockImplementation(() => true);
    const generateIntegrityManifestTakenToRun = await generateIntegrityManifest('browser', '/');
    expect(generateIntegrityManifestTakenToRun).toBe(undefined);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), 'bundle.integrity.manifest.json'),
      JSON.stringify({ browser: 'integrity-hash' }, null, 2)
    );
  });
});
