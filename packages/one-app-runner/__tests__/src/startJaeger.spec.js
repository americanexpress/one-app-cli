/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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
const MockLogStream = require('../../__fixtures__/logStream');
const {
  mockLogs,
  mockJaegerApiRes,
  mockSpanLog,
  mockTraceId,
  mockTraceResponse,
} = require('../../__fixtures__/jaeger');
const { startJaeger } = require('../../src/startJaeger');

jest.mock('node:child_process');
jest.mock('node-fetch');
jest.mock('colorette');

describe('startJaeger', () => {
  let logStream;
  let jaeger;

  beforeEach(async () => {
    jest.clearAllMocks();
    logStream = new MockLogStream();
    jaeger = await startJaeger({ logStream });
  });

  afterEach(async () => {
    await fetch.drain();
    fetch.clearResponses();
  });

  it('pretty prints the logs, dropping info and debug logs', async () => {
    jaeger.stderr.write([mockLogs.info, mockLogs.debug, mockLogs.warn, mockLogs.error, mockLogs.fatal].join(''));
    expect(logStream.logs).toMatchInlineSnapshot(`
Array [
  "[JAEGER] WARN: Using the 0.0.0.0 address exposes this server to every network interface, which may facilitate Denial of Service attacks. Enable the feature gate to change the default and remove this warning.
",
  "[JAEGER] ERROR: HTTP handler, Internal Server Error
    error: \\"grpc stream error: rpc error: code = ResourceExhausted desc = grpc: received message larger than max (7833328 vs. 4194304)\\"
",
  "[JAEGER] FATAL: Failed to init storage factory
    error: \\"failed to create primary Elasticsearch client: health check timeout: Head \\\\\\"http://elasticsearch:9200\\\\\\": dial tcp: lookup elasticsearch on 127.0.0.11:53: no such host: no Elasticsearch node available\\"
",
]
`);
  });

  it('logs a trace URL when a new trace is available', async () => {
    const traceId = mockTraceId();
    fetch.mockResponse(mockJaegerApiRes({ traceId, serviceName: 'my-module' }));
    jaeger.stderr.write(mockSpanLog(traceId));
    await fetch.drain();
    expect(logStream.logs).toEqual([
      `[JAEGER] TRACE: New trace is available to view at http://localhost:16686/trace/${traceId}.\n`,
    ]);
  });

  it('does not log URLs for traces from jaeger services', async () => {
    const traceId = mockTraceId();
    fetch.mockResponse(mockJaegerApiRes({ traceId, serviceName: 'jaeger-all-in-one' }));
    jaeger.stderr.write(mockSpanLog(traceId));
    await fetch.drain();
    expect(logStream.logs).toEqual([]);
  });

  it('only makes one fetch request per trace id', async () => {
    const traceIdOne = mockTraceId();
    const traceIdTwo = mockTraceId();
    const traceIdThree = mockTraceId();

    fetch.mockResponse(mockJaegerApiRes({ traceId: traceIdOne, serviceName: 'my-module' }));
    fetch.mockResponse(mockJaegerApiRes({ traceId: traceIdTwo, serviceName: 'jaeger-all-in-one' }));
    fetch.mockResponse(mockJaegerApiRes({ traceId: traceIdThree, serviceName: 'my-module' }));

    jaeger.stderr.write([mockSpanLog(traceIdOne), mockSpanLog(traceIdOne), mockSpanLog(traceIdTwo)].join(''));
    jaeger.stderr.write([mockSpanLog(traceIdOne), mockSpanLog(traceIdTwo), mockSpanLog(traceIdThree)].join(''));
    jaeger.stderr.write([mockSpanLog(traceIdThree), mockSpanLog(traceIdThree), mockSpanLog(traceIdTwo)].join(''));

    await fetch.drain();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[0][0]).toContain(traceIdOne);
    expect(fetch.mock.calls[1][0]).toContain(traceIdTwo);
    expect(fetch.mock.calls[2][0]).toContain(traceIdThree);
    expect(logStream.logs).toEqual([
      `[JAEGER] TRACE: New trace is available to view at http://localhost:16686/trace/${traceIdOne}.\n`,
      `[JAEGER] TRACE: New trace is available to view at http://localhost:16686/trace/${traceIdThree}.\n`,
    ]);
  });

  it('ignores traces related to its own API requests', async () => {
    const traceIdOne = mockTraceId();
    const traceIdTwo = mockTraceId();
    const traceResponse = mockTraceResponse(traceIdTwo);

    fetch.mockResponse(mockJaegerApiRes({ traceId: traceIdOne, traceResponse, serviceName: 'my-module' }));

    jaeger.stderr.write([mockSpanLog(traceIdOne), mockSpanLog(traceIdOne)].join(''));
    await fetch.drain();
    jaeger.stderr.write(mockSpanLog(traceIdTwo));
    await fetch.drain();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain(traceIdOne);
    expect(logStream.logs).toEqual([
      `[JAEGER] TRACE: New trace is available to view at http://localhost:16686/trace/${traceIdOne}.\n`,
    ]);
  });
});
