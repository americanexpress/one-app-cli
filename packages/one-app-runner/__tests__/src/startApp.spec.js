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
const path = require('node:path');
const fs = require('node:fs');
const childProcess = require('child_process');
const { Writable } = require('node:stream');
const os = require('node:os');
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
  jest.spyOn(fs.promises, 'mkdir');
  jest.spyOn(os, 'homedir');
  jest.spyOn(console, 'warn');

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

    os.homedir.mockImplementation(() => '/home/user');
    fs.promises.mkdir.mockImplementation(() => {});
  });

  it('pulls one app docker image and starts one app', async () => {
    expect.assertions(4);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' });
    expect(mockSpawn.calls[0].command).toMatchInlineSnapshot('"docker"');
    expect(mockSpawn.calls[0].args).toMatchInlineSnapshot(`
      Array [
        "pull",
        "one-app:5.0.0",
      ]
    `);
    expect(mockSpawn.calls[1].command).toMatchInlineSnapshot('"docker"');
    expect(mockSpawn.calls[1].args).toMatchInlineSnapshot(`
Array [
  "run",
  "-t",
  "-p=3000:3000",
  "-p=3001:3001",
  "-p=3002:3002",
  "-p=3005:3005",
  "-p=9229:9229",
  "-e=NODE_ENV=development",
  "-v=/home/user/.one-app:/home/node/.one-app",
  "one-app:5.0.0",
  "/bin/sh",
  "-c",
  "npm config set update-notifier false && node lib/server/index.js --root-module-name=frank-lloyd-root --module-map-url=https://example.com/module-map.json",
]
`);
  });

  it('runs docker run with environment variables', async () => {
    expect.assertions(2);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[1].command).toMatchInlineSnapshot('"docker"');
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-e'))).toEqual([
      '-e=NODE_ENV=development',
      '-e=MY_VAR=123',
    ]);
  });

  it('runs docker run with proxy environment variables if they are set on the users system', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    process.env.HTTP_PROXY = 'https://example.com/proxy';
    process.env.HTTPS_PROXY = 'https://example.com/proxy';
    process.env.NO_PROXY = 'localhost, *.example.com, 192.168.0.1';
    process.env.HTTP_PORT = '9000';
    process.env.HTTP_ONE_APP_DEV_CDN_PORT = '9001';
    process.env.HTTP_ONE_APP_DEV_PROXY_SERVER_PORT = '9002';
    process.env.HTTP_METRICS_PORT = '9005';
    process.env.HTTP_ONE_APP_DEBUG_PORT = '9229';

    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { MY_VAR: '123' },
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-e'))).toEqual([
      '-e=NODE_ENV=development',
      '-e=MY_VAR=123',
      '-e=HTTP_PROXY=https://example.com/proxy',
      '-e=HTTPS_PROXY=https://example.com/proxy',
      '-e=NO_PROXY=localhost, *.example.com, 192.168.0.1',
      '-e=HTTP_PORT=9000',
      '-e=HTTP_ONE_APP_DEV_CDN_PORT=9001',
      '-e=HTTP_ONE_APP_DEV_PROXY_SERVER_PORT=9002',
      '-e=HTTP_METRICS_PORT=9005',
    ]);
  });

  it('mounts and serves modules in docker run if module paths are provided', async () => {
    expect.assertions(2);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v'))).toEqual([
      '-v=/path/to/module-a:/opt/module-workspace/module-a',
      '-v=/path/to-module-b:/opt/module-workspace/to-module-b',
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatchInlineSnapshot('"npm config set update-notifier false && npm run serve-module \'/opt/module-workspace/module-a\' &&npm run serve-module \'/opt/module-workspace/to-module-b\' && node lib/server/index.js --root-module-name=frank-lloyd-root --module-map-url=https://example.com/module-map.json"');
  });

  it('mounts and serves modules in docker run if module paths are provided and moduleMapUrl is not', async () => {
    expect.assertions(2);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a', '/path/to-module-b'],
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v'))).toEqual([
      '-v=/path/to/module-a:/opt/module-workspace/module-a',
      '-v=/path/to-module-b:/opt/module-workspace/to-module-b',
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatchInlineSnapshot('"npm config set update-notifier false && npm run serve-module \'/opt/module-workspace/module-a\' &&npm run serve-module \'/opt/module-workspace/to-module-b\' && node lib/server/index.js --root-module-name=frank-lloyd-root"');
  });

  it('runs set middleware command and starts one app with mock flag in docker run if parrot middleware file is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], parrotMiddlewareFile: '/path/to/module-a/dev.middleware.js',
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatchInlineSnapshot('"npm config set update-notifier false && npm run serve-module \'/opt/module-workspace/module-a\' && npm run set-middleware \'/opt/module-workspace/module-a/dev.middleware.js\' && node lib/server/index.js --root-module-name=frank-lloyd-root --module-map-url=https://example.com/module-map.json -m"');
  });

  it('runs set dev endpoints command in docker run if dev endpoints file is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], devEndpointsFile: '/path/to/module-a/dev.endpoints.js',
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatchInlineSnapshot('"npm config set update-notifier false && npm run serve-module \'/opt/module-workspace/module-a\' && npm run set-dev-endpoints \'/opt/module-workspace/module-a/dev.endpoints.js\' && node lib/server/index.js --root-module-name=frank-lloyd-root --module-map-url=https://example.com/module-map.json"');
  });

  it('sets the network to join if the network name is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockSpawn.calls[1].args).toContain('--network=one-test-environment-1234');
  });

  it('creates a docker network when the flag is provided', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
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
      // eslint-disable-next-line jest/no-conditional-expect -- covered by expect.assertions
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
      // eslint-disable-next-line jest/no-conditional-expect -- covered by expect.assertions
      expect(error).toMatchSnapshot('create network calls');
    }
  });

  it('uses host instead of localhost when the useHost flag is passed', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useHost: true,
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      ' --use-host'
    );
  });

  it('bypasses docker pull when the offline flag is passed', async () => {
    expect.assertions(3);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], offline: true,
    });
    expect(mockSpawn.calls.length).toBe(1);
    expect(mockSpawn.calls[0].command).toBe('docker');
    expect(mockSpawn.calls[0].args[0]).toBe('run');
  });

  it('Passes the container name to the docker --name flag', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], containerName: 'one-app-at-test',
    });
    expect(mockSpawn.calls[1].args).toContain('--name=one-app-at-test');
  });

  it('outputs all logs from docker pull and docker run to a file if output file arg is given', async () => {
    expect.assertions(6);
    const mockSpawn = makeMockSpawn();
    mockSpawn.sequence.add(mockSpawn.simple(0, 'docker pull sequence\n'));
    mockSpawn.sequence.add(mockSpawn.simple(0, 'One App startup sequence\n', 'oh noes\n'));
    childProcess.spawn.mockImplementation(mockSpawn);
    const logFileStream = new Writable({
      construct(callback) {
        this.stringified = '';
        callback();
      },
      write(chunk, encoding, callback) {
        this.stringified += chunk.toString('utf8');
        callback();
      },
    });
    createWriteStreamSpy.mockReturnValueOnce(logFileStream);

    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', outputFile: pathToLogFile,
    });
    expect(createWriteStreamSpy).toHaveBeenCalledWith(pathToLogFile);
    expect(logFileStream.stringified).toMatch('docker pull sequence');
    expect(logFileStream.stringified).toMatch('One App startup sequence');
    expect(logFileStream.stringified).toMatch('oh noes');
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('throws an error if command errors', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    mockSpawn.sequence.add(mockSpawn.simple(0));
    mockSpawn.sequence.add(mockSpawn.simple(1));
    childProcess.spawn.mockImplementation(mockSpawn);
    return expect(
      startApp({ moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0' })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Error running docker. Are you sure you have it installed? For installation and setup details see https://www.docker.com/products/docker-desktop"'
    );
  });

  it('forwards NODE_EXTRA_CA_CERTS from process.env', async () => {
    expect.assertions(2);
    process.env.NODE_EXTRA_CA_CERTS = '/process/env/location/extra_certs.pem';
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0',
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-e=NODE_EXTRA_CA_CERTS'))).toEqual([
      '-e=NODE_EXTRA_CA_CERTS=/opt/certs.pem',
    ]);
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v='))).toEqual([
      '-v=/process/env/location/extra_certs.pem:/opt/certs.pem',
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
  });

  it('runner configs envVar NODE_EXTRA_CA_CERTS has priority over process.env', async () => {
    expect.assertions(2);
    process.env.NODE_EXTRA_CA_CERTS = '/process/env/location/extra_certs.pem';
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', envVars: { NODE_EXTRA_CA_CERTS: '/envVar/location/cert.pem' },
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-e=NODE_EXTRA_CA_CERTS'))).toEqual([
      '-e=NODE_EXTRA_CA_CERTS=/opt/certs.pem',
    ]);
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v='))).toEqual([
      '-v=/envVar/location/cert.pem:/opt/certs.pem',
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
  });

  it('suppresses npm update notifications', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], dockerNetworkToJoin: 'one-test-environment-1234',
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      'npm config set update-notifier false'
    );
  });

  it('applies inspect mode to node process when useDebug is passed', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useDebug: true,
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--inspect=0.0.0.0:9229'
    );
  });

  it('applies inspect mode to with custom port node process when useDebug and env var', async () => {
    expect.assertions(2);
    process.env.HTTP_ONE_APP_DEBUG_PORT = 9221;
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.0.0', modulesToServe: ['/path/to/module-a'], useDebug: true,
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-p'))).toContain('-p=9221:9221');
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--inspect=0.0.0.0:9221'
    );
  });

  it('adds applies log level flag', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.14.0', modulesToServe: ['/path/to/module-a'], logLevel: 'info',
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--log-level=info'
    );
  });

  it('applies log format flag', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.14.0', modulesToServe: ['/path/to/module-a'], logFormat: 'machine',
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--log-format=machine'
    );
  });

  it('adds node flags when one-app version is greater than 5.13.0', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.14.0', modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--dns-result-order=ipv4first --no-experimental-fetch'
    );
  });

  it('adds node flags when one-app version is :latest', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:latest', modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--dns-result-order=ipv4first --no-experimental-fetch'
    );
  });

  it('adds node flags when one-app version is greater than 5.13.0 and is a prerelease', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.14.0-rc1', modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--dns-result-order=ipv4first --no-experimental-fetch'
    );
  });

  it('adds node flags when one-app version is greater than 5.13.0 but only major specified', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5', modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatch(
      '--dns-result-order=ipv4first --no-experimental-fetch'
    );
  });
  it('does NOT add node flags when one-app version is less than 5.13.0', async () => {
    expect.assertions(1);
    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json', rootModuleName: 'frank-lloyd-root', appDockerImage: 'one-app:5.12.0', modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args[mockSpawn.calls[1].args.indexOf('-c') + 1]).toMatchInlineSnapshot('"npm config set update-notifier false && npm run serve-module \'/opt/module-workspace/module-a\' && node lib/server/index.js --root-module-name=frank-lloyd-root --module-map-url=https://example.com/module-map.json"');
  });

  it('ensures the user\'s One App directory exists', async () => {
    expect.assertions(1);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(fs.promises.mkdir.mock.calls[0]).toEqual(['/home/user/.one-app']);
  });

  it('mounts the user\'s One App directory', async () => {
    expect.assertions(1);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v=/home/user/.one-app'))).toEqual([
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
  });

  it('shows a warning when there was an error creating the user\'s One App directory', async () => {
    expect.assertions(2);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    fs.promises.mkdir.mockImplementation(() => {
      throw Object.assign(
        new Error('EROFS: read-only file system, mkdir \'/home/user/.one-app\''),
        {
          errno: -30,
          code: 'EROFS',
          syscall: 'mkdir',
          path: '/home/user/.one-app',
        });
    });
    console.warn.mockClear();
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(console.warn).toHaveBeenCalled();
    expect(console.warn.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Unable to ensure ~/.one-app exists, the module cache will not be used (EROFS: read-only file system, mkdir '/home/user/.one-app')",
      ]
    `);
  });

  it('does not mount the user\'s One App directory when there was an error creating it', async () => {
    expect.assertions(1);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    fs.promises.mkdir.mockImplementation(() => {
      throw Object.assign(
        new Error('EROFS: read-only file system, mkdir \'/home/user/.one-app\''),
        {
          errno: -30,
          code: 'EROFS',
          syscall: 'mkdir',
          path: '/home/user/.one-app',
        });
    });
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v=/home/user/.one-app'))).toEqual([]);
  });

  it('does not show a warning when the user\'s One App directory already exists', async () => {
    expect.assertions(1);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    fs.promises.mkdir.mockImplementation(() => {
      throw Object.assign(
        new Error('EEXIST: file already exists, mkdir \'/home/user/.one-app\''),
        {
          errno: -17,
          code: 'EEXIST',
          syscall: 'mkdir',
          path: '/home/user/.one-app',
        });
    });
    console.warn.mockClear();
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('mounts the user\'s One App directory when it already exists', async () => {
    expect.assertions(1);

    const mockSpawn = makeMockSpawn();
    childProcess.spawn.mockImplementation(mockSpawn);
    fs.promises.mkdir.mockImplementation(() => {
      throw Object.assign(
        new Error('EEXIST: file already exists, mkdir \'/home/user/.one-app\''),
        {
          errno: -17,
          code: 'EEXIST',
          syscall: 'mkdir',
          path: '/home/user/.one-app',
        });
    });
    await startApp({
      moduleMapUrl: 'https://example.com/module-map.json',
      rootModuleName: 'frank-lloyd-root',
      appDockerImage: 'one-app:5.0.0',
      modulesToServe: ['/path/to/module-a'],
    });
    expect(mockSpawn.calls[1].args.filter((arg) => arg.startsWith('-v=/home/user/.one-app'))).toEqual([
      '-v=/home/user/.one-app:/home/node/.one-app',
    ]);
  });
});
