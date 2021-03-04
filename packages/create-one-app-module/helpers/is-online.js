/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

import { execSync } from 'child_process';
import dns from 'dns';
import url from 'url';

function getProxy() {
  if (process.env.HTTPS_PROXY) {
    return process.env.HTTPS_PROXY;
  }
  try {
    const httpsProxy = execSync('npm config get https-proxy').toString().trim();
    return httpsProxy !== 'null' ? httpsProxy : undefined;
  } catch (e) {
    return;
  }
}

export function getOnline() {
  return new Promise((resolve) => {
    dns.lookup('registry.yarnpkg.com', (registryError) => {
      if (!registryError) {
        return resolve(true);
      }
      const proxy = getProxy();
      if (!proxy) {
        return resolve(false);
      }
      const { hostname } = url.parse(proxy);

      if (!hostname) {
        return resolve(false);
      }

      dns.lookup(hostname, (proxyError) => {
        resolve(proxyError == null);
      });
    });
  });
}
