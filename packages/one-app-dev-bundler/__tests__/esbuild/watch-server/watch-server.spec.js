/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

import WebSocket, { WebSocketServer } from 'ws';
import createServerReloadFunction, { noop } from '../../../esbuild/watch-server/watch-server';

jest.mock('ws', () => ({
  __esModule: true,
  WebSocketServer: jest.fn(() => ({
    clients: [{ readyState: 1, send: jest.fn() }],
  })),
  default: jest.fn(),
}));

jest.useFakeTimers();

jest.spyOn(console, 'log');
jest.spyOn(console, 'error');

describe('The watch server', () => {
  let optionsMock;
  let serverReadySend;
  let serverUnReadySend;
  let serverOn;
  const readyStateValue = Symbol('readyState');

  beforeEach(() => {
    jest.clearAllMocks();

    optionsMock = { portMax: 456, portStart: 123 };

    serverReadySend = jest.fn();
    serverUnReadySend = jest.fn();
    serverOn = jest.fn();
    WebSocketServer.mockImplementation(jest.fn(() => ({
      clients: [
        { readyState: readyStateValue, send: serverReadySend },
        { readyState: 0, send: serverUnReadySend },
      ],
      on: serverOn,
    })));

    WebSocket.OPEN = readyStateValue;
  });

  it('should create a webSocketServer and return a function to send a blank message to all ready clients', async () => {
    expect.assertions(8);
    const waitingForListeningPromise = createServerReloadFunction(optionsMock);

    expect(serverOn.mock.calls[0][0]).toBe('listening'); // ensure `on` order is correct
    serverOn.mock.calls[0][1](); // tell the server it is listening so the promise resolves

    const reloadFunction = await waitingForListeningPromise;

    expect(serverReadySend).toHaveBeenCalledTimes(0);
    expect(serverUnReadySend).toHaveBeenCalledTimes(0);

    reloadFunction();
    jest.runAllTimers();

    expect(serverReadySend).toHaveBeenCalledTimes(1);
    expect(serverReadySend).toHaveBeenCalledWith();
    expect(serverUnReadySend).toHaveBeenCalledTimes(0);

    expect(console).toHaveLogs([
      'Watch Server | Started on port 123',
      'Watch Server | Reload clients',
    ]);
    expect(console).not.toHaveErrors();
  });

  it('should throw if there is an exception thrown when creating web server that isnt EADDRINUSE', async () => {
    expect.assertions(4);
    const waitingForListeningPromise = createServerReloadFunction(optionsMock);

    expect(serverOn.mock.calls[1][0]).toBe('error'); // ensure `on` order is correct
    serverOn.mock.calls[1][1](new Error('mockError'));

    let caughtException;
    try {
      await waitingForListeningPromise;
    } catch (err) {
      caughtException = err;
    }
    expect(caughtException).toEqual(new Error('mockError'));

    expect(console).toHaveLogs([
      'Watch Server | Stopped: Error: mockError',
    ]);
    expect(console).not.toHaveErrors();
  });

  it('should start on a higher port if the first ports are not available', async () => {
    expect.assertions(2);

    // set up to reject 3 servers

    // Server 1 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error1 = new Error('listen EADDRINUSE:');
    error1.code = 'EADDRINUSE';
    // Server 1 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error1); });

    // Server 2 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error2 = new Error('listen EADDRINUSE:');
    error2.code = 'EADDRINUSE';
    // Server 2 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error2); });

    // Server 3 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error3 = new Error('listen EADDRINUSE:');
    error3.code = 'EADDRINUSE';
    // Server 3 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error3); });

    // Server 4 = on listen: call to accept this server
    serverOn.mockImplementationOnce((_name, handler) => { handler(); });

    const waitingForListeningPromise = createServerReloadFunction(optionsMock);
    await waitingForListeningPromise;

    expect(console).toHaveLogs([
      'Watch Server | Started on port 126',
    ]);
    expect(console).not.toHaveErrors();
  });

  it('should return a noop function and warn the users if there are no available ports', async () => {
    expect.assertions(5);

    // set up to reject 3 servers

    // Server 1 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error1 = new Error('listen EADDRINUSE:');
    error1.code = 'EADDRINUSE';
    // Server 1 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error1); });

    // Server 2 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error2 = new Error('listen EADDRINUSE:');
    error2.code = 'EADDRINUSE';
    // Server 2 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error2); });

    // Server 3 = on listen: ignore
    serverOn.mockImplementationOnce(() => {});
    const error3 = new Error('listen EADDRINUSE:');
    error3.code = 'EADDRINUSE';
    // Server 3 = on error: call immediately to reject
    serverOn.mockImplementationOnce((_name, handler) => { handler(error3); });

    const waitingForListeningPromise = createServerReloadFunction({ portStart: 0, portMax: 1 });
    const reloadFunction = await waitingForListeningPromise;

    expect(reloadFunction).toBe(noop);
    expect(serverReadySend).toHaveBeenCalledTimes(0);
    expect(serverUnReadySend).toHaveBeenCalledTimes(0);

    expect(console).not.toHaveLogs();
    expect(console).toHaveErrors([
      'Watch Server | Failed to start, There were no available ports in range. Live reload will not work.',
    ]);
  });

  it('should throw if the input port rules are not followed', async () => {
    expect.assertions(7);
    const defaultValues = { portStart: 50, portMax: 1000 };
    const portStartError = 'portStart must be an integer greater than 0';
    const portMaxError = 'portMax must be an integer and must be greater than portStart';

    const createTest = async (overrides) => createServerReloadFunction(
      { ...defaultValues, ...overrides }
    );

    // types
    await expect(createTest({ portStart: 'a String' })).rejects.toThrow(portStartError);
    await expect(createTest({ portStart: true })).rejects.toThrow(portStartError);
    await expect(createTest({ portMax: 'a String' })).rejects.toThrow(portMaxError);

    // start >= max
    await expect(createTest({ portStart: 10000 })).rejects.toThrow(portMaxError);
    await expect(createTest({ portStart: defaultValues.portMax })).rejects.toThrow(portMaxError);

    // max <= start
    await expect(createTest({ portMax: 0 })).rejects.toThrow(portMaxError);
    await expect(createTest({ portMax: defaultValues.portStart })).rejects.toThrow(portMaxError);
  });

  it('the null func should not throw', () => {
    expect(noop).not.toThrow();
  });
});
