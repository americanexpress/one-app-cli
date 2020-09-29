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
import { loadLanguagePack } from '@americanexpress/one-app-ducks';
import { useDispatch } from 'react-redux';
import { subscribe } from 'webpack-hot-middleware/client';

import { libraryName } from '../../constants';

export function formatPayloadMessage(payload) {
  return [libraryName, ' :: ', payload.moduleName, payload.action, payload.path].join(' ');
}

export function logModuleLoad(Module) {
  console.log(['%c', `${libraryName} :: Holocron module "${Module.moduleName}" has been loaded.`].join(' '), 'background: #222; color: #bada55');
}

export function logPayloadEvent(payload) {
  console.log(['%c', formatPayloadMessage(payload)].join(' '), 'background: #222; color: #bada55');
}

export function createSubscriberHandle(Module, dispatch) {
  return (payload) => {
    switch (payload.action) {
      case 'locale:add':
      case 'locale:change':
      case 'locale:remove':
        if (payload.moduleName === Module.moduleName) {
          // TODO: handle remove event correctly
          dispatch(loadLanguagePack(payload.moduleName, {
            force: true,
            fallbackLocale: 'en-US',
          }))
            .then(() => logPayloadEvent(payload));
        }
        break;
      case 'parrot:add':
      case 'parrot:change':
      case 'parrot:remove':
        if (payload.moduleName === Module.moduleName) {
          logPayloadEvent(payload);
        }
        break;
      default:
        break;
    }
  };
}

export default function useHotMiddlewareSubscriber(Module) {
  const dispatch = useDispatch();

  useEffect(() => {
    logModuleLoad(Module);
    subscribe(createSubscriberHandle(Module, dispatch));
  }, []);
}
