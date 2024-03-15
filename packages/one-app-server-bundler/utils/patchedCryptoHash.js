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

// Monkey Patch for unsupported hash algo. Needed to support Node >=17.
// https://github.com/webpack/webpack/issues/13572#issuecomment-923736472
const originalCreateHash = crypto.createHash;
crypto.createHash = (algo) => originalCreateHash(algo === 'md4' ? 'sha256' : algo);
