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

// explicitly requiring within each test needed in order to have independent mocks
/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const Docker = require('dockerode');
const makeMockSpawn = require('mock-spawn');
const startApp = require('../../src/startApp');

const pathToLogFile = path.join(__dirname, '..', 'fixtures', 'app.log');

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('dockerode');

describe('startApp', () => {
  const createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream');
  const stdoutSpy = jest.spyOn(process.stdout, 'write');
  const stderrSpy = jest.spyOn(process.stderr, 'write');

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    delete process.env.HTTP_PORT;
    delete process.env.HTTP_ONE_APP_DEV_CDN_PORT;
    delete process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT;
    delete process.env.HTTP_METRICS_PORT;
    delete process.env.NODE_EXTRA_CA_CERTS;
    delete process.env.HTTP_ONE_APP_DEBUG_PORT;
  });

  it('pulls one app docker image and starts one app', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs docker run with environment variables', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs docker run with proxy environment variables if they are set on the users system', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    process.env.HTTP_PROXY = 'https://example.com/proxy';
    process.env.HTTPS_PROXY = 'https://example.com/proxy';
    process.env.NO_PROXY = 'localhost';
    process.env.HTTP_PORT = '9000';
    process.env.HTTP_ONE_APP_DEV_CDN_PORT = '9001';
    process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT = '9002';
    process.env.HTTP_METRICS_PORT = '9005';
    process.env.HTTP_ONE_APP_DEBUG_PORT = '9229';

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('mounts and serves modules in docker run if module paths are provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('mounts and serves modules in docker run if module paths are provided and moduleMapUrl is not', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs set middleware command and starts one app with mock flag in docker run if parrot middleware file is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], parrotMiddlewareFile: '/path/to/module-a/dev.middleware.js',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs set dev endpoints command in docker run if dev endpoints file is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], devEndpointsFile: '/path/to/module-a/dev.endpoints.js',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('sets the network to join if the network name is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('creates a docker network when the flag is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    const mockCreateNetwork = jest.fn(() => Promise.resolve());
    Docker.mockImplementation(() => ({
      createNetwork: mockCreateNetwork,
    }));
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true, dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockCreateNetwork.mock.calls).toMatchSnapshot('create network calls');
  });

  it('should throw an error if createDockerNetwork is true but dockerNetworkToJoin is not provided', async () => {
    expect.assertions(1);
    try {
      await startApp({
        moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true,
      });
    } catch (error) {
      expect(error).toMatchSnapshot('create network calls');
    }
  });

  it('Displays an error if createNetwork fails', async () => {
    expect.assertions(1);
    const mockCreateNetwork = jest.fn(() => Promise.reject(new Error('Error creating network')));
    Docker.mockImplementation(() => ({
      createNetwork: mockCreateNetwork,
    }));
    try {
      await startApp({
        moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true, dockerNetworkToJoin: 'one-test-environment-1234',
      });
    } catch (error) {
      expect(error).toMatchSnapshot('create network calls');
    }
  });

  it('uses host instead of localhost when the useHost flag is passed', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useHost: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('bypasses docker pull when the offline flag is passed', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], offline: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('Passes the container name to the docker --name flag', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], containerName: 'one-app-at-test',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('outputs all logs from docker pull and docker run to a file if output file arg is given', async () => {
    expect.assertions(5);
    const mockProcess = { on: jest.fn(), stdout: { pipe: jest.fn() }, stderr: { pipe: jest.fn() } };
    const mockSpawn = jest.fn(() => mockProcess);
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    createWriteStreamSpy.mockReturnValueOnce('stream');
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', outputFile: pathToLogFile,
    });
    createWriteStreamSpy.mockReturnValueOnce('stream');
    expect(createWriteStreamSpy).toHaveBeenCalledWith(pathToLogFile);
    expect(mockProcess.stdout.pipe).toHaveBeenCalledWith('stream');
    expect(mockProcess.stderr.pipe).toHaveBeenCalledWith('stream');
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('throws an error if command errors', async () => {
    expect.assertions(2);
    const mockProcess = { on: jest.fn(), stdout: { pipe: jest.fn() }, stderr: { pipe: jest.fn() } };
    const mockSpawn = jest.fn(() => mockProcess);
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' });
    const onErrorFunction = mockProcess.on.mock.calls[0][1];
    expect(mockProcess.on.mock.calls[0][0]).toBe('error');
    expect(onErrorFunction).toThrowErrorMatchingSnapshot('onErrorFunction');
  });

  it('forwards NODE_EXTRA_CA_CERTS from process.env', async () => {
    expect.assertions(1);
    process.env.NODE_EXTRA_CA_CERTS = '/process/env/location/extra_certs.pem';
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runner configs envVar NODE_EXTRA_CA_CERTS has priority over process.env', async () => {
    expect.assertions(1);
    process.env.NODE_EXTRA_CA_CERTS = '/process/env/location/extra_certs.pem';
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { NODE_EXTRA_CA_CERTS: '/envVar/location/cert.pem' },
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('applies inspect mode to node process when useDebug is passed', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useDebug: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('applies inspect mode to with custom port node process when useDebug and env var', async () => {
    expect.assertions(1);
    process.env.HTTP_ONE_APP_DEBUG_PORT = 9221;
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useDebug: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });
});
