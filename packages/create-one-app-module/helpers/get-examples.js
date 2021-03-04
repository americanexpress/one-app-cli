/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

import got from 'got';
import tar from 'tar';
import { Stream } from 'stream';
import { promisify } from 'util';
import 'global-agent/bootstrap';

// These are needed to work behind a proxy
global.GLOBAL_AGENT.HTTPS_PROXY = process.env.HTTPS_PROXY;
global.GLOBAL_AGENT.HTTP_PROXY = process.env.HTTP_PROXY;
global.GLOBAL_AGENT.NO_PROXY = process.env.NO_PROXY;

const pipeline = promisify(Stream.pipeline);
export async function isUrlOk(url) {
  const response = await got.head(url).catch((e) => e);
  return response.statusCode === 200;
}
export async function getRepositoryInformation(url, examplePath) {
  const [, username, name, t, _branch, ...file] = url.pathname.split('/');
  const filePath = examplePath
    ? examplePath.replace(/^\//, '')
    : file.join('/');
  if (t === undefined) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`
    ).catch((e) => e);
    if (infoResponse.statusCode !== 200) {
      return;
    }
    const info = JSON.parse(infoResponse.body);
    return { username, name, branch: info.default_branch, filePath };
  }
  const branch = examplePath
    ? `${_branch}/${file.join('/')}`.replace(new RegExp(`/${filePath}|/$`), '')
    : _branch;
  if (username && name && branch && t === 'tree') {
    return { username, name, branch, filePath };
  }
}
export function hasRepository({ username, name, branch, filePath }) {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`;
  const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`;
  return isUrlOk(`${contentsUrl + packagePath}?ref=${branch}`);
}
export function hasExample(name) {
  return isUrlOk(
    `https://api.github.com/repos/americanexpress/one-app-cli/contents/examples/${encodeURIComponent(
      name
    )}/package.json`
  );
}
export function downloadAndExtractRepository(
  root,
  { username, name, branch, filePath }
) {
  return pipeline(
    got.stream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
    ),
    tar.extract(
      { cwd: root, strip: filePath ? filePath.split('/').length + 1 : 1 },
      [`${name}-${branch}${filePath ? `/${filePath}` : ''}`]
    )
  );
}
export function downloadAndExtractExample(root, name) {
  if (name === '__internal-testing-retry') {
    throw new Error('This is an internal example for testing the CLI.');
  }
  return pipeline(
    got.stream(
      'https://codeload.github.com/americanexpress/one-app-cli/tar.gz/main'
    ),
    tar.extract({ cwd: root, strip: 3 }, [`one-app-cli-main/examples/${name}`])
  );
}
