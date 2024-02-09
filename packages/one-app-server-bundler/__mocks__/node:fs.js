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
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

let files = {};

const fs = {
  _: {
    setFiles: (configuredFiles) => {
      files = configuredFiles || {};
    },

    getFiles: () => files,
  },

  accessSync: jest.fn((filePath) => {
    if (!files[filePath]) {
      throw new Error(`Couldn't access file ${filePath}`);
    }
  }),

  readFileSync: jest.fn((filePath) => {
    if (!files[filePath]) {
      throw new Error(`Couldn't read file ${filePath}`);
    }
    return files[filePath];
  }),

  readFile: jest.fn((filePath, cb) => {
    if (!files[filePath]) {
      cb(new Error(`Couldn't read file ${filePath}`));
    } else {
      cb(undefined, files[filePath]);
    }
  }),

  writeFileSync: jest.fn((filePath, content) => {
    files[filePath] = content;
  }),

  rmdirSync: jest.fn((dirPath) => {
    if (!files[dirPath]) {
      throw new Error(`Couldn't delete dir ${dirPath}`);
    }
    delete files[dirPath];
  }),

  mkdirSync: jest.fn(),

  symlinkSync: jest.fn(),

  unlinkSync: jest.fn(),

  closeSync: jest.fn(),

  stat: jest.fn(),

  statSync: jest.fn(),

  readlink: jest.fn(),

  readlinkSync: jest.fn(),

  readdirSync: jest.fn(),
};

module.exports = fs;
