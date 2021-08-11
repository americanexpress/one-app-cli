/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const initializeGitRepo = require('../../src/utils/initialize-git-repo');
const runCommand = require('../../src/utils/run-command');

jest.mock('../../src/utils/run-command', () => jest.fn());

describe('initializeGitRepo', () => {
  it('should initialize a git repo with a passabe commit message on the main branch', async () => {
    await initializeGitRepo('repoPathMock');

    expect(runCommand.mock.calls).toMatchSnapshot();
  });
});
