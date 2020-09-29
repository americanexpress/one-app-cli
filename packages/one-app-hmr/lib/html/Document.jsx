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
import { fromJS } from 'immutable';
import transit from 'transit-immutable-js';

import { getPublicPath } from '../webpack/utility';

/* eslint-disable react/prop-types */
export default function Document({
  modules = [],
  externals = [],
  moduleMap,
  rootModuleName,
  lang = 'en-US',
} = {}) {
  /* eslint-enable react/prop-types */
  const state = transit.toJSON(
    fromJS({
      config: {
        cdnUrl: getPublicPath(),
        rootModuleName,
        reportingUrl: '/error',
      },
      intl: {
        activeLocale: lang,
      },
    })
  );

  return (
    <html lang={lang}>
      <head>
        <title>One App Development</title>
        {React.Children.toArray(
          modules.filter(({ css }) => !!css).map(({ css }) => <link rel="stylesheet" href={css} />)
        )}
      </head>
      <body>
        <div id="root" />
        <script
          id="initial-state"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
            window.__render_mode__ = 'render';
            window.__webpack_public_path__ = '/static/app/';
            window.__holocron_module_bundle_type__ = 'browser';
            window.__pwa_metadata__ = { serviceWorker: false };
            window.__CLIENT_HOLOCRON_MODULE_MAP__ = ${JSON.stringify(
              moduleMap || {}
            )};
            window.__INITIAL_STATE__ = ${JSON.stringify(state)};
          `,
          }}
        />
        <script src="/static/app/app~vendors.js" />
        <script src="/static/app/runtime.js" />
        <script src="/static/app/vendors.js" />
        <script src="/static/app/i18n/en-us.js" />
        {React.Children.toArray(
          externals.map(({ src }) => <script src={src} />)
        )}
        {React.Children.toArray(
          modules.map(({ src }) => <script src={src} crossOrigin="anonymous" />)
        )}
        <script src="/static/app/app.js" />
      </body>
    </html>
  );
}
