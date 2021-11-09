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

// import { getOptions } from 'loader-utils';

import HolocronWebpackLoader from '../../../../src/webpack/loaders/holocron-webpack-loader';
import { packageName } from '../../../../src/constants';

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({
    moduleName: 'root-module',
  })),
}));

describe('HolocronWebpackLoader', () => {
  const source = ['import Module from "./components/Module";', 'export default Module;'].join('\n');

  const expectedModifiedSource = `
/* Holocron Module */
import Module from "./components/Module";
import wrapper from '${packageName}/src/components/HolocronHmrWrapper.jsx';
Module.moduleName = "root-module";
const HolocronModule = wrapper(Module);
export default HolocronModule;`.trim();

  test('modifies the source of an incoming Holocron module entry file', () => {
    const modifiedSource = HolocronWebpackLoader(source);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });

  test('does not modify the source of an incoming Holocron module entry if previously modified', () => {
    const modifiedSource = HolocronWebpackLoader(expectedModifiedSource);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });
});
