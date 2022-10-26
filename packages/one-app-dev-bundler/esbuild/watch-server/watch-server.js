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

let chosenPort = null;
let socketServer = null;

// Start a WebSocket Server, wrap it in a promise for easier exception handling.
const startWatchServer = async (options) => new Promise((resolve, reject) => {
  const wss = new WebSocketServer(options);

  wss.on('listening', () => {
    // once the server is fully set up we can resolve
    resolve(wss);
  });

  wss.on('error', (err) => {
    if (!err.message.startsWith('listen EADDRINUSE:')) {
      console.log(`Watch Server | Stopped: ${err}`);
    }
    // if the server fails to start, reject
    reject(err);
  });
});

async function startServerAndCreateReloadFunction(wsServerOptions) {
  socketServer = await startWatchServer({
    ...wsServerOptions,
    port: chosenPort,
  });

  const reloadFunction = () => {
    setTimeout(() => {
      console.log('Watch Server | Reload clients');
      socketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send();
        }
      });
    }, 50);
  };

  console.log(`Watch Server | Started on port ${chosenPort}`);

  return reloadFunction;
}

export const closeWebsocketServer = () => {
  socketServer.close();
};

export const noop = () => {};

const createServerReloadFunction = async ({ portStart, portMax }, wsServerOptions = {}) => {
  if (!Number.isInteger(portStart) || portStart < 0) {
    throw new Error('portStart must be an integer greater than 0');
  }

  if (!Number.isInteger(portMax) || portMax <= portStart) {
    throw new Error('portMax must be an integer and must be greater than portStart');
  }

  chosenPort = portStart;

  while (chosenPort < portMax) {
    try {
      // eslint-disable-next-line no-await-in-loop -- loop here is to specifically iterate over the port number. Thus, await in loop is fine
      return await startServerAndCreateReloadFunction(wsServerOptions);
    } catch (err) {
      // If we cant start a server because the port is already in use. go to next port.
      if (err.code !== 'EADDRINUSE') {
        throw err;
      }
      chosenPort += 1;
    }
  }

  console.error('Watch Server | Failed to start, There were no available ports in range. Live reload will not work.');

  return noop;
};

export default createServerReloadFunction;

export const getWatchServerPort = () => chosenPort;
