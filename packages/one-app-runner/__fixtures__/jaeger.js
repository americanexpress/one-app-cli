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

const { v4: uuidv4 } = require('uuid');

const mockTraceId = () => uuidv4().replace(/-/g, '').slice(0, 32);
const mockSpanId = () => uuidv4().replace(/-/g, '').slice(0, 16);
const mockTraceResponse = (traceId) => `00-${traceId || mockTraceId()}-${mockSpanId()}-01`;

const mockJaegerApiRes = ({ traceId, traceResponse, serviceName = 'jaeger-all-in-one' }) => ({
  url: `http://localhost:16686/api/traces/${traceId}`,
  headers: { traceresponse: traceResponse || mockTraceResponse() },
  json: JSON.parse(`{"data":[{"traceID":"${traceId}","spans":[{"traceID":"${traceId}","spanID":"${mockSpanId()}","operationName":"/api/services/{service}/operations","references":[],"startTime":1711683181193790,"duration":526,"tags":[{"key":"http.method","type":"string","value":"GET"},{"key":"http.scheme","type":"string","value":"http"},{"key":"net.host.name","type":"string","value":"localhost"},{"key":"net.host.port","type":"int64","value":16686},{"key":"net.sock.peer.addr","type":"string","value":"192.168.65.1"},{"key":"net.sock.peer.port","type":"int64","value":39977},{"key":"user_agent.original","type":"string","value":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"},{"key":"http.target","type":"string","value":"/api/services/tracing-demo/operations"},{"key":"net.protocol.version","type":"string","value":"1.1"},{"key":"http.route","type":"string","value":"/api/services/{service}/operations"},{"key":"http.wrote_bytes","type":"int64","value":652},{"key":"http.status_code","type":"int64","value":200},{"key":"span.kind","type":"string","value":"server"},{"key":"internal.span.format","type":"string","value":"otlp"}],"logs":[],"processID":"p1","warnings":null}],"processes":{"p1":{"serviceName":"${serviceName}","tags":[{"key":"host.name","type":"string","value":"a8446fbabf4b"},{"key":"os.type","type":"string","value":"linux"},{"key":"otel.library.name","type":"string","value":"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"},{"key":"otel.library.version","type":"string","value":"0.49.0"},{"key":"telemetry.sdk.language","type":"string","value":"go"},{"key":"telemetry.sdk.name","type":"string","value":"opentelemetry"},{"key":"telemetry.sdk.version","type":"string","value":"1.24.0"}]}},"warnings":null}],"total":0,"limit":0,"offset":0,"errors":null}`),
});

const mockSpanLog = (traceId, spanId) => `{"level":"debug","ts":1711677918.2096832,"caller":"app/span_processor.go:165","msg":"Span written to the storage by the collector","trace-id":"${traceId || mockTraceId()}","span-id":"${spanId || mockSpanId()}"}\n`;

const mockLogs = {
  info: '{"level":"info","ts":1711677619.1002743,"caller":"grpc@v1.62.0/clientconn.go:1223","msg":"[core][Channel #1 SubChannel #2] Subchannel Connectivity change to CONNECTING","system":"grpc","grpc_log":true}\n',
  debug: mockSpanLog(),
  warn: '{"level":"warn","ts":1711677618.112061,"caller":"internal@v0.95.0/warning.go:42","msg":"Using the 0.0.0.0 address exposes this server to every network interface, which may facilitate Denial of Service attacks. Enable the feature gate to change the default and remove this warning.","documentation":"https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks","feature gate ID":"component.UseLocalHostAsDefaultHost"}\n',
  error: '{"level": "error","ts": 1680074638.9349482,"caller":"app/http_handler.go:495","msg":"HTTP handler, Internal Server Error","error":"grpc stream error: rpc error: code = ResourceExhausted desc = grpc: received message larger than max (7833328 vs. 4194304)","stacktrace":"mock stacktrace"}\n',
  fatal: '{"level":"fatal","ts":1711678733.242641,"caller":"all-in-one/main.go:114","msg":"Failed to init storage factory","error":"failed to create primary Elasticsearch client: health check timeout: Head \\"http://elasticsearch:9200\\": dial tcp: lookup elasticsearch on 127.0.0.11:53: no such host: no Elasticsearch node available","stacktrace":"mock stacktrace"}\n',
};

module.exports = {
  mockLogs,
  mockJaegerApiRes,
  mockSpanLog,
  mockTraceId,
  mockSpanId,
  mockTraceResponse,
};
