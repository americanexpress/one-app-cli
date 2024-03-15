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
const crypto = require('node:crypto');

const createHashSpy = jest.spyOn(crypto, 'createHash');

/* eslint-disable global-require -- testing on-require functionality */
describe('patchedCryptoHash', () => {
  it('should replace md4 with sha256 as default hash algo', () => {
    require('../../utils/patchedCryptoHash');
    crypto.createHash('md4');
    expect(createHashSpy).toHaveBeenCalledWith('sha256');
  });
  it('should keep hash if different than md4', () => {
    require('../../utils/patchedCryptoHash');
    crypto.createHash('sha512');
    expect(createHashSpy).toHaveBeenCalledWith('sha512');
  });
});
/* eslint-enable global-require -- testing on-require functionality */
