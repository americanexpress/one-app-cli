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

const validateNodeEnv = require('../../utils/validateNodeEnv');

describe('validateNodeEnv', () => {
  let originalNodeEnv;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not throw if NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    expect(validateNodeEnv).not.toThrow();
  });

  it('should not throw if NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    expect(validateNodeEnv).not.toThrow();
  });

  it('should throw if NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    expect(validateNodeEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if NODE_ENV is invalid', () => {
    process.env.NODE_ENV = 'test';
    expect(validateNodeEnv).toThrowErrorMatchingSnapshot();
  });
});
