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

import { getAggregatedStyles, emptyAggregatedStyles, addStyle } from '../../../esbuild/utils/server-style-aggregator';

describe('serverSideAggirgator utilities', () => {
  beforeEach(() => {
    emptyAggregatedStyles();
    jest.clearAllMocks();
  });

  describe('addStyle', () => {
    it('should append given perameter to aggregatedStyles', () => {
      addStyle('testing string');
      expect(getAggregatedStyles()).toBe('testing string');
    });
  });
  describe('getAggrigatedStyles', () => {
    it('should return string of any and all collected styles', () => {
      expect(getAggregatedStyles()).toBe('');
    });
  });
  describe('emptyAggrigatedStyles', () => {
    it('should return emptied string', () => {
      addStyle('testing string');
      emptyAggregatedStyles();
      expect(getAggregatedStyles()).toBe('');
    });
  });
});
