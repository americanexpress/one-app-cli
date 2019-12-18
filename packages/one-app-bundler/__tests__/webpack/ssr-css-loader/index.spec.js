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

jest.mock('path', () => ({
  resolve: (dir, filename) => `/path/to/one-app-bundler/webpack/ssr-css-loader/${filename}`,
}));

describe('SSR CSS loader', () => {
  const consoleSpy = jest.spyOn(console, 'log');

  beforeEach(() => consoleSpy.mockClear());

  it('should throw an error when the css-loader is not present', () => {
    expect(() => SSRCSSLoader('no css-loader here!')).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader('exports = module.exports = require("css-loader/dist/runtime/api.js")();')).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader('exports = module.exports = require("../../css-loader/dist/runtime/api.js")(true);')).toThrowErrorMatchingSnapshot();
    expect(() => SSRCSSLoader(`
      // some other line
      exports = module.exports = require("../../see-ess-ess-loader/lib/see-ess-ess-base.js")(undefined);
      // imports


      // module
      exports.push([module.id, "/**comment**/.react-select__One___hIKe {\n  position: relative; }\n\n.react-select__also___8ObpT {\n  background-color: #f9f9f9; }\n", ""]);

      // exports
      exports.locals = {
      \t"One": "react-select__One___hIKe",
      \t"also": "react-select__also___8ObpT",
      };
    `)).toThrowErrorMatchingSnapshot();
  });

  it('should remove css-loader\'s css-base, replace its push and export the locals', () => {
    expect(SSRCSSLoader('exports = module.exports = require("../../node_modules/css-loader/dist/runtime/api.js")(undefined);')).toMatchSnapshot();
    expect(SSRCSSLoader('exports = module.exports = require("../../css-loader/dist/runtime/api.js")();')).toMatchSnapshot();
    expect(SSRCSSLoader('exports = module.exports = require("./css-loader/dist/runtime/api.js")();')).toMatchSnapshot();
    expect(SSRCSSLoader('exports = module.exports = require("./css-loader/dist/runtime/api.js")(undefined);')).toMatchSnapshot();
    expect(SSRCSSLoader(`
      // some other line
      exports = module.exports = require("../../css-loader/dist/runtime/api.js")(undefined);
      // imports


      // module
      exports.push([module.id, "/**comment**/.react-select__One___hIKe {\n  position: relative; }\n\n.react-select__also___8ObpT {\n  background-color: #f9f9f9; }\n", ""]);

      // exports
      exports.locals = {
      \t"One": "react-select__One___hIKe",
      \t"also": "react-select__also___8ObpT",
      };
    `)).toMatchSnapshot();
    expect(SSRCSSLoader('exports = module.exports = require("../../node_modules/css-loader/dist/runtime/api.js")(false);')).toMatchSnapshot();
    expect(SSRCSSLoader('exports = module.exports = require("./css-loader/dist/runtime/api.js")(false);')).toMatchSnapshot();
    expect(SSRCSSLoader(`
      // some other line
      exports = module.exports = require("../../css-loader/dist/runtime/api.js")(false);
      // imports


      // module
      exports.push([module.id, "/**comment**/.react-select__One___hIKe {\n  position: relative; }\n\n.react-select__also___8ObpT {\n  background-color: #f9f9f9; }\n", ""]);

      // exports
      exports.locals = {
      \t"One": "react-select__One___hIKe",
      \t"also": "react-select__also___8ObpT",
      };
    `)).toMatchSnapshot();
  });
});
