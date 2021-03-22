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

const {
  downloadAndExtractExample,
  downloadAndExtractRepository,
  getRepositoryInformation,
  hasExample,
  hasRepository,
} = require('../../helpers/getExamples');

jest.mock('got', () => jest.fn({
  statusCode: 200,
  body: JSON.stringify('hello'),
}));

describe('getExample', () => {
  it('Gets the Repo Information', async () => {
    const url = {
      pathname: '/americanexpress/one-app-cli/examples',
    };
    const repoInfo = await getRepositoryInformation(url);
    expect(repoInfo).toMatchSnapshot();
  });
  it('returns if statusCode is not 200', async () => {
    const got404 = () => ({
      statusCode: 404,
    });
    got.mockImplementationOnce(got404);
    const url = {
      pathname: '/americanexpress/one-app-cli/examples',
    };
    const repoInfo = await getRepositoryInformation(url);
    expect(repoInfo).toMatchSnapshot();
  });
});
