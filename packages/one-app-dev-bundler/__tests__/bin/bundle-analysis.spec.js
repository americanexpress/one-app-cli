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

import analyzeBundles from '../../utils/analyze-bundles';

jest.mock('../../utils/analyze-bundles', () => jest.fn(() => Promise.resolve()));

describe('bundle-analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a build for each build target, with watch and live off, and no bundler config', () => {
    expect.assertions(2);

    // eslint-disable-next-line global-require -- this test is testing an on-import behaviour
    require('../../bin/bundle-analysis');

    expect(analyzeBundles).toHaveBeenCalledTimes(1);
    expect(analyzeBundles).toHaveBeenCalledWith();
  });
});
