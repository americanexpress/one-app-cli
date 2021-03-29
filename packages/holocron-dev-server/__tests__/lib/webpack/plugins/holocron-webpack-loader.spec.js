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

import { getOptions } from 'loader-utils';

import HolocronWebpackLoader from '../../../../lib/webpack/plugins/holocron-webpack-loader';
import { packageName } from '../../../../lib/constants';

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({
    hot: true,
    rootModule: false,
    moduleName: 'root-module',
    externals: [],
  })),
}));

describe('HolocronWebpackLoader', () => {
  const source = ['import Module from "./components/Module";', 'export default Module;'].join('\n');

  const expectedModifiedSource = `
/* Holocron Module */
import Module from "./components/Module";
import wrapper from '${packageName}/lib/components/HolocronHmrWrapper.jsx';
Module.moduleName = "root-module";
const HolocronModule = wrapper(Module);
export default HolocronModule;`.trim();

  const externalLibName = 'an-external-library';
  const expectedModifiedSourceWithExternals = `
${expectedModifiedSource}
window.__holocron_externals__ = {
'an-external-library': { module: require('an-external-library') },
};
if ('appConfig' in HolocronModule === false) HolocronModule.appConfig = {};
HolocronModule.appConfig.providedExternals = window.__holocron_externals__;
window.getTenantRootModule = () => HolocronModule;
    `.trim();

  test('modifies the source of an incoming Holocron module entry file', () => {
    const modifiedSource = HolocronWebpackLoader(source);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });

  test('does not modify the source of an incoming Holocron module entry if previously modified', () => {
    const modifiedSource = HolocronWebpackLoader(expectedModifiedSource);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });

  test('includes externals if root Holocron module is being used and provides externals', () => {
    getOptions.mockImplementationOnce(() => ({
      hot: false,
      rootModule: true,
      moduleName: 'root-module',
      externals: [externalLibName],
    }));
    const modifiedSource = HolocronWebpackLoader(source);
    expect(modifiedSource).toEqual(
      expectedModifiedSourceWithExternals.replace('HolocronHmrWrapper', 'RegisterModule')
    );
  });
});