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

import { getExternalLibraryName } from '../../utils/getExternalLibraryName';

describe('getExternalLibraryName', () => {
  it('creates a library name using an external name and version', () => {
    expect(getExternalLibraryName('@amex/test-lib', '1.2.3')).toBe('__holocron_external__amex_test_lib__1_2_3');
  });
});
