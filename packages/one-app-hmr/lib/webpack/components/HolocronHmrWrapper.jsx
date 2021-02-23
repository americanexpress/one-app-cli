/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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
import { registerModule } from 'holocron';
import { loadLanguagePack } from '@americanexpress/one-app-ducks';
import { useDispatch } from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';
import { subscribe } from 'webpack-hot-middleware/client';

function formatPayloadMessage(payload) {
  return ['one-app-hmr :: ', payload.moduleName, payload.action, payload.path].join(' ');
}

export default function createHolocronHmrWrapper(Module) {
  const HotModule = hoistStatics((props) => {
    const dispatch = useDispatch();
    React.useEffect(() => {
      console.log(['%c', `one-app-hmr :: Hot Holocron module "${Module.moduleName}" has been loaded.`].join(' '), 'background: #222; color: #bada55');
      subscribe((payload) => {
        switch (payload.action) {
          case 'locale:add':
          case 'locale:change':
          case 'locale:remove':
            if (payload.moduleName === Module.moduleName) {
              dispatch(loadLanguagePack(payload.moduleName, payload.locale, true))
                .then(() => {
                  console.log(['%c', formatPayloadMessage(payload)].join(' '), 'background: #222; color: #bada55');
                });
            }
            break;
          case 'parrot:add':
          case 'parrot:change':
          case 'parrot:remove':
            if (payload.moduleName === Module.moduleName) {
              console.log(['%c', formatPayloadMessage(payload)].join(' '), 'background: #222; color: #bada55');
            }
            break;
          default:
            break;
        }
      });
    }, []);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Module {...props} />;
  }, Module);

  registerModule(Module.moduleName, HotModule);

  return HotModule;
}
