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

import mockFs from 'mock-fs';
import fs from 'fs';
import serverStylesDispatcher from '../../../esbuild/plugins/server-styles-dispatcher';
import { runSetupAndGetLifeHooks } from './__plugin-testing-utils__';
import { emptyAggregatedStyles, addStyle } from '../../../esbuild/utils/server-style-aggregator';
import { BUNDLE_TYPES } from '../../../esbuild/constants/enums';

describe('server styles dispatcher', () => {
  describe('on end lifecycle hook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      emptyAggregatedStyles();
    });
    const mockBundleFileName = 'mockBundle.server.js';
    const resultsMock = {
      metafile: {
        outputs: {
          'mock/file/name.html': {},
          [mockBundleFileName]: {},
        },
      },
    };

    it('should append js to the end of the file to register an exports.ssrStyles value containing all module styles\'', async () => {
      expect.assertions(3);

      // get the hooks
      const hooks = runSetupAndGetLifeHooks(
        serverStylesDispatcher({ bundleType: BUNDLE_TYPES.SERVER })
      );
      const onEnd = hooks.onEnd[0];
      addStyle('digestMock', 'body{background: white;}body > p{font-color: black;}');

      /* onEnd test start */
      // mock the bundle using mockFs
      mockFs(
        { [mockBundleFileName]: 'const mock = "JavaScript Content";' },
        { createCwd: false, createTmp: false }
      );
      const results = await onEnd(resultsMock);

      // since this test uses mockFs, and onEnd writes the file, read it to verify it
      const actualBundleContent = await fs.promises.readFile(mockBundleFileName, 'utf8');

      mockFs.restore();
      expect(results).toBe(resultsMock);
      expect(results).toStrictEqual(resultsMock);
      expect(actualBundleContent).toMatchInlineSnapshot(`
"const mock = \\"JavaScript Content\\";
    ;module.exports.ssrStyles = {
      aggregatedStyles: [{\\"css\\":\\"body{background: white;}body > p{font-color: black;}\\",\\"digest\\":\\"digestMock\\"}],
      getFullSheet: function getFullSheet() {
  return this.aggregatedStyles.reduce((acc, { css }) => acc + css, '');
},
    };"
`);

      /* onEnd test end */
    });

    it('should do nothing if there is no results metadata', async () => {
      expect.assertions(1);

      // get the hooks
      const hooks = runSetupAndGetLifeHooks(
        serverStylesDispatcher({ bundleType: BUNDLE_TYPES.SERVER })
      );
      const onEnd = hooks.onEnd[0];

      // mock the bundle using mockFs
      mockFs(
        { [mockBundleFileName]: 'const mock = "JavaScript Content";' },
        { createCwd: false, createTmp: false }
      );
      await onEnd({});

      // since this test uses mockFs, and onEnd writes the file, read it to verify it is unchanged
      const actualBundleContent = await fs.promises.readFile(mockBundleFileName, 'utf8');
      mockFs.restore();
      expect(actualBundleContent).toMatchInlineSnapshot('"const mock = \\"JavaScript Content\\";"');
    });
  });
  describe('bundle type browser', () => {
    it('registers no hooks', () => {
      const hooks = runSetupAndGetLifeHooks(
        serverStylesDispatcher({ bundleType: BUNDLE_TYPES.BROWSER })
      );
      expect(hooks).toStrictEqual({});
    });
  });
});
