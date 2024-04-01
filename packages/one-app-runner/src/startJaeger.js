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

const childProcess = require('node:child_process');
const util = require('node:util');
const { Transform } = require('node:stream');
const fetch = require('node-fetch');
const pinoPretty = require('pino-pretty');
const {
  dockerPull,
  portsToDockerArgs,
} = require('../utils/docker');
const objectToFlags = require('../utils/objectToFlags');
const createExpiringSet = require('../utils/expiringSet');

const JAEGER_IMAGE_REFERENCE = 'jaegertracing/all-in-one:1.55';
const JAEGER_IMAGE_NAME = JAEGER_IMAGE_REFERENCE.replace(/[./:]/g, '-');
const JAEGER_QUERY_PORT = 16686; // query: serve frontend
const JAEGER_OTLP_PORT = 4317; // collector: accept OpenTelemetry Protocol (OTLP) over gRPC

const LOG_LEVELS = {
  silent: 0,
  debug: 10,
  info: 20,
  trace: 30,
  warn: 40,
  error: 50,
  panic: 55,
  fatal: 60,
};

const getJaegerEnvVarsForOneApp = ({
  includeJaeger,
  useDockerNetwork,
  rootModuleName,
}) => (includeJaeger ? {
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: `http://${useDockerNetwork ? JAEGER_IMAGE_NAME : 'host.docker.internal'}:${JAEGER_OTLP_PORT}/v1/traces`,
  OTEL_SERVICE_NAME: rootModuleName,
  OTEL_SERVICE_NAMESPACE: 'one-app-runner',
} : {});

class PreProcessLogsTransform extends Transform {
  constructor() {
    super({ writableObjectMode: true });
    this.ignoreTraceIds = createExpiringSet();
  }

  // eslint-disable-next-line no-underscore-dangle -- this is the Transform stream API
  _transform(chunk, encoding, callback) {
    const log = chunk.toString();
    const lines = log.split('\n');
    this.push(lines.map(this.preprocessLog.bind(this)).join('\n'));
    callback();
  }

  // eslint-disable-next-line no-underscore-dangle -- this is the Transform stream API
  _final(callback) {
    this.ignoreTraceIds.destroy();
    callback();
  }

  preprocessLog(log) {
    try {
      const parsed = JSON.parse(log);
      parsed.level = LOG_LEVELS[parsed.level];
      const traceId = parsed['trace-id'];
      if (traceId && !this.ignoreTraceIds.has(traceId)) {
        this.logTraceUrl(traceId);
      }
      return JSON.stringify(parsed);
    } catch (err) {
      return log;
    }
  }

  async logTraceUrl(traceId) {
    this.ignoreTraceIds.add(traceId);
    try {
      const res = await fetch(`http://localhost:${JAEGER_QUERY_PORT}/api/traces/${traceId}`);
      this.ignoreTraceIds.add(res.headers.get('traceresponse').split('-')[1]);
      const data = await res.json();
      const serviceName = data?.data?.[0]?.processes?.p1?.serviceName;
      if (serviceName && !serviceName.includes('jaeger')) {
        this.push(`${JSON.stringify({
          level: LOG_LEVELS.trace,
          msg: 'New trace is available to view at %s.',
          url: `http://localhost:${JAEGER_QUERY_PORT}/trace/${traceId}`,
        })}\n`);
      }
    } catch (err) {
      // ignore
    }
  }
}

async function startJaeger({
  logStream,
  network,
  offline,
}) {
  if (!offline) {
    await dockerPull(JAEGER_IMAGE_REFERENCE, logStream);
  }

  const jaegerProcess = childProcess.spawn(
    'docker',
    [
      'run',
      objectToFlags({
        rm: true,
        name: JAEGER_IMAGE_NAME,
        network,
      }),
      '-e=JAEGER_DISABLED=true', // this does not work, hence the need to fetch for service name (https://www.jaegertracing.io/docs/1.55/monitoring/#traces)
      portsToDockerArgs([JAEGER_QUERY_PORT, JAEGER_OTLP_PORT]),
      JAEGER_IMAGE_REFERENCE,
      '--log-level=debug',
    ].flat()
  );
  /* eslint max-params: [1,4] -- customPrettifiers & messageFormat take a lot of params */
  jaegerProcess.stderr
    .pipe(new PreProcessLogsTransform())
    .pipe(pinoPretty({
      messageKey: 'msg',
      errorKey: 'error',
      include: 'level,msg,error,status,trace-id,span-id',
      customLevels: LOG_LEVELS,
      minimumLevel: LOG_LEVELS.trace,
      customColors: 'info:blue,error:red,fatal:bgRed,panic:bgRed,warn:yellow,debug:green,trace:magenta,',
      destination: logStream,
      customPrettifiers: {
        level: (level, key, log, { labelColorized, colors }) => colors.dim(`${colors.gray('[JAEGER]')} ${labelColorized}`),
      },
      messageFormat: (log, messageKey, levelLabel, { colors }) => {
        let message = log[messageKey];
        if (log.level === LOG_LEVELS.trace) {
          message = util.format(log[messageKey], colors.underline(colors.blue(log.url)));
        }
        return colors.dim(colors.gray(message));
      },
    }));
  return jaegerProcess;
}

module.exports = {
  getJaegerEnvVarsForOneApp,
  startJaeger,
};
