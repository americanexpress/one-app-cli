/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

const prettier = require('prettier');

const formatJSX = (string) => prettier.format(string, {
  semi: true, parser: 'babel', jsxSingleQuote: true, singleQuote: true,
});
const formatJSON = (string) => JSON.stringify(JSON.parse(string), null, 2);

const getFormatter = (fileExtension) => {
  switch (fileExtension) {
    case '.jsx':
      return formatJSX;
    case '.json':
      return formatJSON;
    default:
      return (string) => string;
  }
};

module.exports = {
  getFormatter,
};
