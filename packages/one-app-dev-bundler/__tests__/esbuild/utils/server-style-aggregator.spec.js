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

import {
  getAggregatedStyles,
  emptyAggregatedStyles,
  addStyle,
} from '../../../esbuild/utils/server-style-aggregator';

describe('serverSideAggregatorStyles utilities', () => {
  beforeEach(() => {
    emptyAggregatedStyles();
  });

  describe('addStyle', () => {
    it('should append styles to the aggregatedStyles as an object with a digest and css key', () => {
      addStyle('digestMock', 'cssMock', false);
      expect(getAggregatedStyles()).toBe('[{"css":"cssMock","digest":"digestMock"}]');
    });

    it('should deduplicate styles added that share the same digest', () => {
      addStyle('digestMock', 'cssMock', false);
      addStyle('digestMock', 'cssMock', false);
      addStyle('digestMock', 'cssMock', false);
      addStyle('digestMock', 'cssMock', false);
      expect(getAggregatedStyles()).toBe('[{"css":"cssMock","digest":"digestMock"}]');
    });
  });

  describe('getAggregatedStyles', () => {
    it('should return a stringified empty array when no styles have been added', () => {
      expect(getAggregatedStyles()).toBe('[]');
    });

    it('should return a stringified array with dependency styles declared first and local styles declared last', () => {
      addStyle('digestLocalMock', 'cssLocalMock', false);
      addStyle('digestDepsMock', 'cssDepsMock', true);
      expect(getAggregatedStyles()).toBe('[{"css":"cssDepsMock","digest":"digestDepsMock"},{"css":"cssLocalMock","digest":"digestLocalMock"}]');
    });
  });

  describe('emptyAggregatedStyles', () => {
    it('should return emptied string', () => {
      addStyle('digestMock', 'cssMock', false);
      expect(getAggregatedStyles()).toBe('[{"css":"cssMock","digest":"digestMock"}]');
      emptyAggregatedStyles();
      expect(getAggregatedStyles()).toBe('[]');
    });
  });
});
