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

import { bundleType as defaultBundleType } from '../constants';
import { getPublicAppUrl } from '../utils/paths';

/* eslint-disable react/prop-types */
export default function Document({
  bundleType = defaultBundleType,
  scripts = [],
  moduleMap = {},
  initialState = {},
  lang = 'en-US',
}) {
  return (
    <html lang={lang}>
      <head>
        <title>Holocron dev server</title>
      </head>
      <body>
        <div id="root" />
        <script
          id="initial-state"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              window.__render_mode__ = 'render';
              window.__webpack_public_path__ = '${getPublicAppUrl()}';
              window.__holocron_module_bundle_type__ = '${bundleType}';
              window.__pwa_metadata__ = { serviceWorker: false };
              window.__CLIENT_HOLOCRON_MODULE_MAP__ = ${JSON.stringify(moduleMap)};
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
            `.split('\n').map((line) => line.trim()).join('').trim(),
          }}
        />
        <script src={getPublicAppUrl('app~vendors.js')} />
        <script src={getPublicAppUrl('runtime.js')} />
        <script src={getPublicAppUrl('vendors.js')} />
        <script src={getPublicAppUrl(`i18n/${lang.toLowerCase()}.js`)} />
        {React.Children.toArray(
          scripts.map(({ src }) => <script src={src} />)
        )}
        <script src={getPublicAppUrl('app.js')} />
      </body>
    </html>
  );
}
