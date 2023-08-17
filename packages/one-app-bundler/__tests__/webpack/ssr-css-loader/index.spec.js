/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const SSRCSSLoader = require('../../../webpack/loaders/ssr-css-loader');

jest.mock('node:path', () => ({
  resolve: (dir, filename) => `/path/to/one-app-bundler/webpack/ssr-css-loader/${filename}`,
}));

describe('SSR CSS loader', () => {
  const consoleSpy = jest.spyOn(console, 'log');

  beforeEach(() => consoleSpy.mockClear());

  it('should throw an error when the css-loader is not present', () => {
    expect(() => SSRCSSLoader('no css-loader here!')).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! css-loader/dist/runtime/api.js */ "css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___();`)).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "../../css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(true);`)).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader(`
    // Imports
    var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../see-ess-ess-loader/lib/see-ess-ess-base.js */ "../../see-ess-ess-loader/lib/see-ess-ess-base.js");
    exports = ___CSS_LOADER_API_IMPORT___(undefined);
    // Module
    exports.push([module.i, ".my-root__ErrorLayout__ErrorLayout___2B91F {\n  margin: 0 auto;\n}\n\n.my-root__ErrorLayout__main___2IftH {\n  max-width: 1000px;\n  width: 100%;\n  margin: 0 auto;\n  padding: 10px;\n}", ""]);
    // Exports
    exports.locals = {
    \t"ErrorLayout": "my-root__ErrorLayout__ErrorLayout___2B91F",
    \t"main": "my-root__ErrorLayout__main___2IftH"
    };
    module.exports = exports;
    `)).toThrowErrorMatchingSnapshot();
  });

  it('should remove css-loader\'s css-base, replace its push and export the locals', () => {
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("../../node_modules/css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(undefined);`)).toMatchSnapshot();
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("../../css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___();`)).toMatchSnapshot();
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("./css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___();`)).toMatchSnapshot();
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("./css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(undefined);`)).toMatchSnapshot();
    expect(SSRCSSLoader(`
      // Imports
      var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
      exports = ___CSS_LOADER_API_IMPORT___(undefined);
      // Module
      exports.push([module.i, ".my-root__ErrorLayout__ErrorLayout___2B91F {\n  margin: 0 auto;\n}\n\n.my-root__ErrorLayout__main___2IftH {\n  max-width: 1000px;\n  width: 100%;\n  margin: 0 auto;\n  padding: 10px;\n}", ""]);
      // Exports
      exports.locals = {
      \t"ErrorLayout": "my-root__ErrorLayout__ErrorLayout___2B91F",
      \t"main": "my-root__ErrorLayout__main___2IftH"
      };
      module.exports = exports;
    `)).toMatchSnapshot();
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("../../node_modules/css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(false);`)).toMatchSnapshot();
    expect(SSRCSSLoader(`var ___CSS_LOADER_API_IMPORT___ = __webpack_require__("./css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(false);`)).toMatchSnapshot();
    expect(SSRCSSLoader(`
      // Imports
      var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "../../css-loader/dist/runtime/api.js");
      exports = ___CSS_LOADER_API_IMPORT___(false);
      // Module
      exports.push([module.i, ".my-root__ErrorLayout__ErrorLayout___2B91F {\n  margin: 0 auto;\n}\n\n.my-root__ErrorLayout__main___2IftH {\n  max-width: 1000px;\n  width: 100%;\n  margin: 0 auto;\n  padding: 10px;\n}", ""]);
      // Exports
      exports.locals = {
      \t"ErrorLayout": "my-root__ErrorLayout__ErrorLayout___2B91F",
      \t"main": "my-root__ErrorLayout__main___2IftH"
      };
      module.exports = exports;
    `)).toMatchSnapshot();
  });
});
