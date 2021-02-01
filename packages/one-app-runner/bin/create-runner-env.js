#!/usr/bin/env node

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
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

const getPort = require('get-port');
const uuid = require('uuid/v4');
const fs = require('fs-extra');

const createRunnerEnv = async () => {
  const httpPort = await getPort();
  const devCdnPort = await getPort();
  const devProxyServer = await getPort();
  const metricsPort = await getPort();
  const networkName = `one-app-environment-${uuid()}`;

  await fs.writeFile('.env',
    `HTTP_PORT=${httpPort}
HTTP_ONE_APP_DEV_CDN_PORT=${devCdnPort}
NETWORK_NAME=${networkName}
HTTP_ONE_APP_DEV_PROXY_SERVER_PORT=${devProxyServer}
HTTP_METRICS_PORT=${metricsPort}
  `);
};

createRunnerEnv().catch((error) => {
  /* eslint-disable no-console */
  console.log();
  console.error('⚠️   Error creating environment variables: \n', error);
  /* eslint-enable no-console */
});
