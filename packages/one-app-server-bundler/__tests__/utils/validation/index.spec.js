/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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
const { validateBundler } = require('../../../utils/validation');

describe('bundler validation', () => {
  it('does not throw with a validate config', () => {
    const bundlerOptions = {
      providedExternals: [
        'some-library',
        'other-library',
      ],
      app: {
        compatibility: '^5.0.0',
      },
      purgecss: {
        paths: ['/dummy-path'],
      },
    };

    expect(() => validateBundler(bundlerOptions)).not.toThrow();
    expect(validateBundler(bundlerOptions)).toEqual(bundlerOptions);
  });
  test('invalid bundler options', () => {
    const bundlerOptions = {
      providedExternals: [],
      app: {
        compatibility: 5,
      },
      performanceBudget: '500e3',
      purgecss: {
        paths: [],
        extractors: [{
          extractor: 500e3,
          extensions: [],
        }],
        disabled: 'false',
      },
    };

    expect(() => validateBundler(bundlerOptions)).toThrow(new Error([
      'Externals must have at least one entry',
      '"performanceBudget" must be a number',
      '"app.compatibility" must be a string',
      '"purgecss.paths" does not contain 1 required value(s)',
      '"purgecss.extractors[0].extractor" must be a string',
      '"purgecss.extractors[0].extensions" does not contain 1 required value(s)',
      '"purgecss.extractors" does not contain 1 required value(s)',
      '"purgecss.disabled" must be a boolean',
    ].join('. ')));
  });
});
