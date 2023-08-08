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

const fetch = require('node-fetch');
const waitForOK = require('../../utils/waitForOK');

jest.mock('node-fetch');

describe('waitForOk', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve to true if the URL quickly returns an OK status', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementation(() => Promise.resolve({ ok: true }));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(0);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should resolve to true if the URL returns an OK status before the timeout', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')))
      .mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')))
      .mockImplementation(() => Promise.resolve({ ok: true }));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should reject if the URL does not return an OK status by the timeout', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementation(() => Promise.reject(new Error('connection mock refused')));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 1500 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).rejects.toMatchInlineSnapshot('[Error: timed out after 1500ms]');
  });

  it('should reject if the abort controller signal triggers before polling gets an OK status', async () => {
    expect.assertions(1);

    fetch
      .mockClear()
      .mockImplementation(() => Promise.reject(new Error('connection mock refused')));

    const abortController = new AbortController();
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000, signal: abortController.signal });

    jest.advanceTimersByTime(2000);

    abortController.abort('This operation was aborted');

    await expect(waitingPromise).rejects.toMatchInlineSnapshot('[Error: This operation was aborted]');
  });
});
