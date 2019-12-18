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

const getCssBase = require('../../../webpack/loaders/ssr-css-loader/css-base');

describe('CSS base', () => {
  it('should return a function that returns an object of functions', () => {
    expect(getCssBase()).toEqual(expect.objectContaining({
      push: expect.any(Function),
      getFullSheet: expect.any(Function),
    }));
  });

  it('should push styles to a private array that can be retreived as a string', () => {
    const { push, getFullSheet } = getCssBase();
    push([1, '.highlight { background:yellow; }']);
    push([2, 'h1 { font-size: 3em; }']);
    expect(getFullSheet()).toMatchSnapshot();
  });
});
