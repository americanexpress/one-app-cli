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

const startApp = require('../../src/startApp');

const pathToLogFile = path.join(__dirname, '..', 'fixtures', 'app.log');

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('dockerode');

describe('startApp', () => {
  beforeEach(() => {
    jest
      .resetModules()
      .resetAllMocks()
      .restoreAllMocks();

    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    delete process.env.HTTP_PORT;
    delete process.env.HTTP_ONE_APP_DEV_CDN_PORT;
    delete process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT;
    delete process.env.HTTP_METRICS_PORT;
    jest.spyOn(process.stdout, 'write');
    jest.spyOn(process.stderr, 'write');
    jest.spyOn(require('fs'), 'createWriteStream');
  });

  afterAll(() => {
    fs.unlinkSync(pathToLogFile);
  });

  it('pulls one app docker image and starts one app', () => {
    const mockSpawn = require('mock-spawn')();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs docker run with environment variables', () => {
    const mockSpawn = require('mock-spawn')();
    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs docker run with proxy environment variables if they are set on the users system', () => {
    const mockSpawn = require('mock-spawn')();
    process.env.HTTP_PROXY = 'https://example.com/proxy';
    process.env.HTTPS_PROXY = 'https://example.com/proxy';
    process.env.NO_PROXY = 'localhost';
    process.env.HTTP_PORT = '9000';
    process.env.HTTP_ONE_APP_DEV_CDN_PORT = '9001';
    process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT = '9002';
    process.env.HTTP_METRICS_PORT = '9005';

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('mounts and serves modules in docker run if module paths are provided', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('mounts and serves modules in docker run if module paths are provided and moduleMapUrl is not', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs set middleware command and starts one app with mock flag in docker run if parrot middleware file is provided', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], parrotMiddlewareFile: '/path/to/module-a/dev.middleware.js',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('runs set dev endpoints command in docker run if dev endpoints file is provided', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], devEndpointsFile: '/path/to/module-a/dev.endpoints.js',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('sets the network to join if the network name is provided', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('creates a docker network when the flag is provided', () => {
    const mockCreateNetwork = jest.fn(() => Promise.resolve());
    Docker.mockImplementation(() => ({
      createNetwork: mockCreateNetwork,
    }));
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true, dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockCreateNetwork.mock.calls).toMatchSnapshot('create network calls');
  });

  it('should throw an error if createDockerNetwork is true but dockerNetworkToJoin is not provided', () => {
    const startAppTest = startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true,
    });
    expect(startAppTest).rejects.toMatchSnapshot('create network calls');
  });

  it('Displays an error if createNetwork fails', () => {
    const mockCreateNetwork = jest.fn(() => Promise.reject(new Error('Error creating network')));
    Docker.mockImplementation(() => ({
      createNetwork: mockCreateNetwork,
    }));
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], createDockerNetwork: true, dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockCreateNetwork()).rejects.toMatchSnapshot('create network calls');
  });

  it('uses host instead of localhost when the useHost flag is passed', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useHost: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('bypasses docker pull when the offline flag is passed', () => {
    const mockSpawn = require('mock-spawn')();

    childProcess.spawn.mockImplementationOnce(mockSpawn);
    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], offline: true,
    });
    expect(mockSpawn.calls[0].command).toMatchSnapshot();
  });

  it('outputs all logs from docker pull and docker run to a file if output file arg is given', () => {
    const mockSpawn = require('mock-spawn')();
    const mockStdout = 'hello world (stdout)';
    const mockStderr = 'hello erroneous world (stderr)';
    mockSpawn.setDefault(mockSpawn.simple(0, mockStdout, mockStderr));
    childProcess.spawn.mockImplementationOnce(mockSpawn);

    startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', outputFile: pathToLogFile,
    });

    const createWriteStreamSpy = require('fs').createWriteStream;
    expect(createWriteStreamSpy).toHaveBeenCalledWith(pathToLogFile);
    expect(process.stdout.write).not.toHaveBeenCalled();
    expect(process.stderr.write).not.toHaveBeenCalled();
  });

  it('throws an error if command errors', () => {
    const mockSpawn = jest.fn(() => ({ on: jest.fn() }));
    childProcess.spawn.mockImplementationOnce(mockSpawn);

    startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' });

    const onFunction = mockSpawn.mock.results[0].value.on;
    const onErrorFunction = onFunction.mock.calls[0][1];
    expect(
      () => onErrorFunction()
    ).toThrowErrorMatchingSnapshot('onErrorFunction');
  });
});
