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

import React from 'react';
import ReactDOM from 'react-dom/server';
import { registerModule } from 'holocron';

import RegisterModule from '../../../lib/components/RegisterModule';

jest.mock('holocron', () => ({
  registerModule: jest.fn((name, module) => module),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RegisterModule', () => {
  it('creates standard Holocron wrapper from a Holocron module', () => {
    const Module = { moduleName: 'root-module' };
    const WrappedModule = RegisterModule(Module);
    expect(WrappedModule).toBe(Module);
    expect(registerModule).toHaveBeenCalledWith(Module.moduleName, WrappedModule);
  });

  it('does not render to the dom other than its children', () => {
    function Module() {
      return <p>module output</p>;
    }
    module.moduleName = 'module';
    const WrappedModule = RegisterModule(Module);
    const result = ReactDOM.renderToStaticMarkup(<WrappedModule />);
    expect(result).toEqual('<p>module output</p>');
  });
});
