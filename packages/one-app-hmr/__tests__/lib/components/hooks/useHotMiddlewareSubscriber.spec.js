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

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadLanguagePack } from '@americanexpress/one-app-ducks';
import { subscribe } from 'webpack-hot-middleware/client';

import useHotMiddlewareSubscriber, {
  createSubscriberHandle,
} from '../../../../lib/components/hooks/useHotMiddlewareSubscriber';

jest.mock('react', () => ({
  useEffect: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => Promise.resolve()),
}));
jest.mock('@americanexpress/one-app-ducks', () => ({
  loadLanguagePack: jest.fn(),
}));
jest.mock('webpack-hot-middleware/client', () => ({
  subscribe: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => null);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useHotMiddlewareSubscriber', () => {
  test('it calls useEffect and useDispatch when invoked', () => {
    const Module = { moduleName: 'some-hot-module' };
    const hook = useHotMiddlewareSubscriber(Module);
    expect(hook).toBe(undefined);
    expect(useEffect).toHaveBeenCalled();
    expect(useDispatch).toHaveBeenCalled();
  });

  test('it subscribes to webpack hot middleware event stream', () => {
    const Module = { moduleName: 'some-hot-module' };
    useHotMiddlewareSubscriber(Module);
    const [[handle]] = useEffect.mock.calls;
    expect(() => handle()).not.toThrow();
    expect(subscribe).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
});

describe('createSubscriberHandle', () => {
  test('creates a handler function for webpack hot middleware', () => {
    const handle = createSubscriberHandle();
    expect(handle).toBeInstanceOf(Function);
  });

  test('subscriber handle does nothing to events unrelated to locales or parrot', () => {
    const handle = createSubscriberHandle({});
    expect(handle).toBeInstanceOf(Function);
    const payload = {
      action: 'internal action',
    };
    expect(() => handle(payload)).not.toThrow();
    expect(console.log).not.toHaveBeenCalled();
  });

  describe('parrot events', () => {
    test('subscriber handle logs parrot updates if targeting the given module', () => {
      const moduleName = 'holocron-module';
      const handle = createSubscriberHandle({ moduleName });
      expect(handle).toBeInstanceOf(Function);
      const payload = {
        moduleName,
        action: 'parrot:add',
      };
      expect(() => handle(payload)).not.toThrow();
      expect(console.log).toHaveBeenCalled();
    });

    test('subscriber handle does not log parrot updates if for a different module', () => {
      const moduleName = 'holocron-module';
      const handle = createSubscriberHandle({ moduleName });
      expect(handle).toBeInstanceOf(Function);
      const payload = {
        moduleName: 'another-module',
        action: 'parrot:add',
      };
      expect(() => handle(payload)).not.toThrow();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('locale events', () => {
    const promise = Promise.resolve();
    const dispatch = jest.fn(() => promise);
    test('subscriber handle logs locale updates if targeting the given module', () => {
      const moduleName = 'holocron-module';
      const locale = 'en-us';
      const handle = createSubscriberHandle({ moduleName }, dispatch);
      expect(handle).toBeInstanceOf(Function);
      const payload = {
        moduleName,
        locale,
        action: 'locale:add',
      };
      expect(() => handle(payload)).not.toThrow();
      expect(loadLanguagePack).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalled();
      return promise.then(() => {
        expect(console.log).toHaveBeenCalled();
      });
    });

    test('subscriber handle does nothing for locale updates if for a different module', () => {
      const moduleName = 'holocron-module';
      const handle = createSubscriberHandle({ moduleName }, dispatch);
      expect(handle).toBeInstanceOf(Function);
      const payload = {
        moduleName: 'another-module',
        action: 'locale:add',
      };
      expect(() => handle(payload)).not.toThrow();
      expect(loadLanguagePack).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
