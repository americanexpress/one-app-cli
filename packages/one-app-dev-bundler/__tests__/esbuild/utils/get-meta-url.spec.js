/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// This test is not possible due to limitations of mjs currently.
// using import.meta in a jest test causes a syntax error. At runtime it wont.

// import getMetaUrl from "../../../esbuild/utils/get-meta-url.mjs";

describe('the getMetaUrl util function', () => {
  it('should return the meta url for the current module', () => {
    // We want this file to explain why this test is not possible
    // jest requires test files contain tests
    // eslint required tests contain assertion.
    expect(true).toBe(true);
  });
});
