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

const { generatorBanner, stepBanner } = require('../../src/utils/log');

jest.mock('../../package.json', () => ({
  version: 'packageVersionMock',
}));

describe('log functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log');
  });
  describe('generatorBanner', () => {
    it('should output the correct string', () => {
      generatorBanner();
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line no-console
      expect(console.log.mock.calls[0]).toMatchSnapshot();
    });
  });
  describe('stepBanner', () => {
    it('should output the correct string for all 5 steps', () => {
      stepBanner(1);
      stepBanner(2);
      stepBanner(3);
      stepBanner(4);
      stepBanner(5);
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(5);
      // snapshot all 5 calls all at once
      // eslint-disable-next-line no-console
      expect(console.log.mock.calls).toMatchSnapshot();
    });
    it('should do nothing if called with an index out of range', () => {
      stepBanner(0);
      stepBanner(-1);
      stepBanner(6);
      stepBanner(100);
      stepBanner('index');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
