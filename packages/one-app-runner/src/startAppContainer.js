const { createHash } = require('node:crypto');

const Docker = require('dockerode');

const spawn = require('./asyncSpawn');
const spawnAndPipe = require('./spawnAndPipe');

const docker = new Docker();

function generateArgsHash({
  imageReference, // String
  containerShellCommand, // String
  ports, // array
  envVars, // Map
  mounts, // Map
  network, // String
}) {
  const hashing = createHash('md5');
  hashing.update(imageReference);
  if (network) {
    hashing.update(network);
  }
  hashing.update(ports.join(','));
  for (const [key, value] of envVars.entries()) {
    hashing.update(`${key}=${value}`);
  }
  for (const [hostPath, containerPath] of mounts.entries()) {
    hashing.update(`${hostPath}=${containerPath}`);
  }
  // TODO: remove this from the hash if we start to use docker exec to serve and unserve modules
  hashing.update(containerShellCommand);
  // though middleware is a startup option, so not all commands can be executed later
  return hashing.digest('hex').slice(0, 7);
}

function pipeContainerLogs(containerName) {
  return spawnAndPipe(
    'docker',
    [
      'logs',
      '--follow',
      '--tail', '1',
      containerName,
    ]
  );
}

function setupPausingOnInterrupt(hashedName) {
  [
    'SIGINT',
    'SIGTERM',
  ].forEach((signal) => {
    process.once(signal, () => {
      console.log(`pausing container ${hashedName}`);
      docker.getContainer(hashedName).pause();
    });
  });
}

async function createAndStartContainer({
  imageReference,
  containerShellCommand,
  ports /* = [] */,
  envVars /* = new Map() */,
  mounts /* = new Map() */,
  name,
  network,
}) {
  let createResult;
  try {
    createResult = await spawn(
      'docker',
      [
        'create',
        ...ports.map((port) => `-p=${port}:${port}`),
        ...[...envVars.entries()].map(([envVarName, envVarValue]) => `-e=${envVarName}=${envVarValue}`),
        ...[...mounts.entries()].map(([hostPath, containerPath]) => `-v=${hostPath}:${containerPath}`),
        name ? `--name=${name}` : null,
        network ? `--network=${network}` : null,
        imageReference,
        '/bin/sh',
        '-c',
        containerShellCommand,
      ].filter(Boolean)
    );
  } catch (creationError) {
    console.error(`unable to create image "${name}"`, creationError.code, creationError.stderr, creationError.stdout);
    throw creationError;
  }

  console.log('create results:', createResult);
  const containerId = createResult.stdout.toString('utf8').trim();
  await spawn('docker', ['start', containerId]);
  setupPausingOnInterrupt(containerId);
  return pipeContainerLogs(containerId);
}

module.exports = async function startAppContainer({
  imageReference,
  containerShellCommand,
  ports /* = [] */,
  envVars /* = new Map() */,
  mounts /* = new Map() */,
  name,
  network,
  logStream, // FIXME: respect the logStream, not just to process.stdout
}) {
  // FIXME: if `name` is specified, this may be part of a test setup and we shoud NOT try to reuse an existing container?

  // can we reuse an existing (paused) container?
  // hash the args
  const argsHash = generateArgsHash({
    imageReference,
    containerShellCommand,
    ports,
    envVars,
    mounts,
    network,
  });
  const hashedName = `${name || 'one-app'}_argset-${argsHash}`;
  // look for a container
  const container = docker.getContainer(hashedName);

  let lowLevelInfo;
  try {
    lowLevelInfo = await container.inspect();
  } catch (inspectionError) {
    if (inspectionError.reason === 'no such container' && inspectionError.statusCode === 404) {
      console.log(`No container named ${hashedName} found to reuse. Starting a new container with this name.`);
      setupPausingOnInterrupt(hashedName);
      return createAndStartContainer({
        imageReference,
        containerShellCommand,
        ports,
        envVars,
        mounts,
        name: hashedName,
        network,
      });
    }
    throw inspectionError;
  }
  console.log(lowLevelInfo.State);
  const containerStatus = lowLevelInfo.State.Status;
  // check its status (is it paused?)
  if (containerStatus === 'paused') {
    console.log(`found paused container ${hashedName}, unpausing and streaming the logs here`);
    container.unpause();
    setupPausingOnInterrupt(hashedName);
    return pipeContainerLogs(hashedName);
  }

  if (containerStatus === 'created') {
    console.log(`found created container ${hashedName}, starting and streaming the logs here`);
    container.start();
    setupPausingOnInterrupt(hashedName);
    return pipeContainerLogs(hashedName);
  }

  if (containerStatus === 'exited') {
    // FIXME: inspect lowLevelInfo.State.Error and lowLevelInfo.State.ExitCode
    console.log(`found stopped container ${hashedName}, starting and streaming the logs here`);
    container.start();
    setupPausingOnInterrupt(hashedName);
    return pipeContainerLogs(hashedName);
  }

  if (containerStatus === 'running') {
    console.log(`found running container ${hashedName}, streaming the logs here`);
    setupPausingOnInterrupt(hashedName);
    return pipeContainerLogs(hashedName);
  }

  throw new Error(`Unknown state for container ${hashedName}, please save any work in the container, delete it, and try again.`);
};
