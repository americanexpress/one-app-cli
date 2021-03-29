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
import ReactDOM from 'react-dom/server';

import Document from '../../../lib/components/Document';
import { getPublicVendorsUrl, getPublicModulesUrl } from '../../../lib/utils';

describe('Document', () => {
  test('renders the document without props', () => {
    const html = ReactDOM.renderToStaticMarkup(
      // eslint-disable-next-line react/react-in-jsx-scope
      <Document />
    );
    expect(html).toMatchSnapshot();
  });

  test('renders the document with the props passed', () => {
    const rootModuleName = 'root-module';
    const rootModulePublicUrl = getPublicModulesUrl(`${rootModuleName}/${rootModuleName}.js`);
    const props = {
      scripts: [
        {
          // external
          src: getPublicVendorsUrl('vendors.js'),
        },
        {
          // module
          name: rootModuleName,
          src: rootModulePublicUrl,
        },
      ],
      moduleMap: {
        modules: {
          [rootModuleName]: {
            browser: rootModulePublicUrl,
          },
        },
      },
    };
    const html = ReactDOM.renderToStaticMarkup(
      // eslint-disable-next-line react/react-in-jsx-scope
      <Document {...props} />
    );
    expect(html).toMatchSnapshot();
  });
});
