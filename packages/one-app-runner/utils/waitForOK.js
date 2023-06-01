/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

/* eslint prefer-arrow-callback: ["error", { "allowNamedFunctions": true }] --
   named functions are easier to identify when inspecting a stack trace */
const fetch = require('node-fetch');

const waitForOK = ({ url, timeout, signal }) => new Promise((resolve, reject) => {
  async function poll() {
    let status;
    try {
      status = (await fetch(url)).ok;
    } catch (pollError) {
      // poll again later
      return undefined;
    }

    /*
      eslint-disable-next-line no-use-before-define --
      this poll function must be defined to build the value of pollingHandle
    */
    clearInterval(pollingHandle);
    /*
      eslint-disable-next-line no-use-before-define --
      pollingHandle must be defined to build the value of timeoutHandle,
      pollingHandle depends on this poll function
    */
    clearTimeout(timeoutHandle);
    return resolve(status);
  }

  const pollingHandle = setInterval(poll, 1000);
  // the interval will start after the duration between, trying now is desireable
  setImmediate(poll, 0);

  const timeoutHandle = setTimeout(function pollingTimedOut() {
    clearInterval(pollingHandle);
    return reject(new Error(`timed out after ${timeout}ms`));
  }, timeout);

  if (signal) {
    signal.addEventListener('abort', () => {
      clearInterval(pollingHandle);
      clearTimeout(timeoutHandle);
      return reject(new Error(signal.reason));
    }, { once: true });
  }
});

module.exports = waitForOK;
