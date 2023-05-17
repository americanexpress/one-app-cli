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

require('dotenv').config();
const { spawn } = require('child_process');
const { waitForOK } = require('../utils/waitForOK');

const command = `one-app-runner --output-file=one-app-test.log --create-docker-network --docker-network-to-join=${process.env.NETWORK_NAME} --use-host`;

const run = async () => {
  spawn(command, { shell: true, stdio: 'ignore', detached: true }).unref();
  const port = process.env.HTTP_PORT;
  const timeout = 200000;

  console.log(`Waiting for One App to start on port ${port}`);

  const resolvedStatus = await waitForOK({
    url: `http://localhost:${port}/_/status`,
    timeout,
  });

  if (resolvedStatus) {
    console.log(`One App server started successfully on port ${port}`);
  } else {
    console.error(`One App failed to start within ${timeout}ms. Please check the one-app-test.log for more information.`);
    process.exit(1);
  }
};

run();
