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

import { renderDocument } from '../utils';
import { logRenderedHolocronModules } from '../utils/logs';

export default function createRenderingMiddleware({
  rootModuleName,
  moduleMap,
  modules,
  clientConfig,
}) {
  let html = null;
  const render = () => {
    html = Buffer.from(
      renderDocument({
        modules,
        moduleMap,
        rootModuleName,
        clientConfig,
      })
    );
    logRenderedHolocronModules(modules);
  };

  return (_, res) => {
    if (!html) render();
    res.status(200).type('html').send(html);
  };
}
