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
import { registerModule } from 'holocron';
import hoistStatics from 'hoist-non-react-statics';

import useHotMiddlewareSubscriber from './hooks/useHotMiddlewareSubscriber';

export default function createHolocronHmrWrapper(Module) {
  // eslint-disable-next-line prefer-arrow-callback -- maintain `this` bind
  const HotModule = hoistStatics(function HolocronHmrWrapper(props) {
    useHotMiddlewareSubscriber(Module);
    // eslint-disable-next-line react/jsx-props-no-spreading -- HOCs can spread props
    return <Module {...props} />;
  }, Module);

  registerModule(Module.moduleName, HotModule);

  return HotModule;
}
