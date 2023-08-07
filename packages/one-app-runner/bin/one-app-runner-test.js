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
const { spawn } = require('node:child_process');
const waitForOK = require('../utils/waitForOK');

(async function main() {
  const port = process.env.HTTP_PORT;
  const timeout = 200000;

  const runnerProcess = spawn(
    `one-app-runner --output-file=one-app-test.log --create-docker-network --docker-network-to-join=${process.env.NETWORK_NAME} --use-host`,
    {
      shell: true,
      detached: true,
      // pipe the process STDIO to the user's terminal
      // in the event of errors that need to be diagnosed
      //
      // inherit also manages the streams to not keep Node.js open
      // which would be a manual task using the default 'pipe'
      stdio: 'inherit',
    }
  );

  /*
    the intention is to
    1. start the runner process
    2. end this process
    3. tests run
    4. then the test runner ends the runner process

    so we need to tell Node.js not to wait for the one-app-runner process to exit
  */
  runnerProcess.unref();

  const runnerStarted = new Promise((resolve, reject) => {
    runnerProcess
      .on('error', reject)
      .on('close', (code) => reject(
        new Error(`one-app-runner exited when it was expected to remain running (exit code ${code})`)
      ));
  });

  console.log(`Waiting for One App to start on port ${port} (timeout of ${timeout}ms)`);

  const serverPingableAbortController = new AbortController();
  const serverPingable = waitForOK({
    url: `http://localhost:${port}/_/status`,
    timeout,
    signal: serverPingableAbortController.signal,
  });

  try {
    await Promise.race([runnerStarted, serverPingable]);
  } catch (startupError) {
    process.exitCode = 1;
    console.error('failed to start One App, please check any messages above and the file one-app-test.log for more information.', startupError);
    runnerProcess.kill();
    serverPingableAbortController.abort();
    return;
  }

  console.log(`One App server started successfully on port ${port}`);
}());
