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
  isUrlOk,
} = require('../../helpers/getExamples');

jest.mock('got', () => jest.fn({
  statusCode: 200,
  body: JSON.stringify('hello'),
}));

// 54, 79-93

describe('getExample', () => {
  describe('isUrlOk', () => {
    beforeEach(() => jest.clearAllMocks());
    it('returns true if statusCode is 200', async () => {
      const testUrl = 'https://example.com/success';
      got.head = jest.fn().mockImplementation(() => ({
        statusCode: 200,
      }));
      const urlOk = await isUrlOk(testUrl);
      expect(urlOk).toBe(true);
    });
    it('returns false if statusCode is not 200', async () => {
      const testUrl = 'https://example.com/not-found';
      got.head = jest.fn().mockImplementation(() => ({
        statusCode: 404,
      }));
      const urlOk = await isUrlOk(testUrl);
      expect(urlOk).toBe(false);
    });
  });
  describe('getRepositoryInformation', () => {
    beforeEach(() => jest.clearAllMocks());
    it('gets repository information', async () => {
      const url = {
        pathname: '/americanexpress/one-app-cli/examples',
      };
      const repoInfo = await getRepositoryInformation(url);
      expect(repoInfo).toMatchSnapshot();
    });
    it('succeeds without examples directory passed', async () => {
      const url = {
        pathname: '/americanexpress/one-app-cli',
      };
      const got200 = () => Promise.resolve({
        statusCode: 200,
        body: JSON.stringify('hello world'),
      });
      got.mockImplementationOnce(got200);

      await getRepositoryInformation(url);

      expect(got.mock.calls[0]).toEqual(expect.arrayContaining(['https://api.github.com/repos/americanexpress/one-app-cli']));
    });
    it('handles a 404', async () => {
      const url = {
        pathname: '/americanexpress/one-app-cli',
      };
      const got404 = () => Promise.resolve({
        statusCode: 404,
        body: JSON.stringify('hello world'),
      });
      got.mockImplementationOnce(got404);
      await getRepositoryInformation(url);

      const { statusCode } = await got.mock.results[0].value;
      expect(statusCode).toEqual(404);
    });
    it('throws an error if got throws', () => {
      const url = {
        pathname: '/americanexpress/one-app-cli',
      };
      const gotError = new Error('Rejected');
      const gotRejected = () => Promise.reject(gotError);
      got.mockImplementationOnce(gotRejected);

      expect(getRepositoryInformation(url)).rejects.toThrow(gotError);
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
    it('handles passing an examplePath', async () => {
      const url = {
        pathname: '/americanexpress/one-app-cli/examples',
      };
      const examplePath = 'foo/bar';
      const got200 = () => Promise.resolve({
        statusCode: 200,
        body: JSON.stringify('hello world'),
      });
      got.mockImplementationOnce(got200);
      const repoInfo = await getRepositoryInformation(url, examplePath);
      expect(repoInfo).toMatchSnapshot();
    });
  });
  describe('hasRepository', () => {
    it('returns if there is a repository', async () => {
      const repoInfo = {
        username: 'americanexpress',
        name: 'one-app-cli',
        branch: 'main',
        filePath: 'test/path',
      };

      got.head = jest.fn().mockImplementation(() => ({
        statusCode: 200,
      }));
      const repoFound = await hasRepository(repoInfo);
      expect(repoFound).toBe(true);
    });
  });
  describe('hasExample', () => {
    it('returns if there is an example', async () => {
      got.head = jest.fn().mockImplementation(() => ({
        statusCode: 200,
      }));
      const exampleFound = await hasExample('with-fetchye');
      expect(exampleFound).toBe(true);
    });
  });
});
