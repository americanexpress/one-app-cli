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

const got = require('got');
const tar = require('tar');
const { Stream } = require('stream');
const { promisify } = require('util');

const {
  downloadAndExtractExample,
  downloadAndExtractRepository,
  getRepositoryInformation,
  hasExample,
  hasRepository,
} = require('../../helpers/getExamples');

describe('getExample', () => {
  it('Gets the Repo Information', async () => {
    const url = new URL('https://github.com/americanexpress/one-app-cli/examples');
    console.log(url.pathname);
    const repoInfo = await getRepositoryInformation(url);
    expect(repoInfo).toMatchSnapshot();
  });
});
