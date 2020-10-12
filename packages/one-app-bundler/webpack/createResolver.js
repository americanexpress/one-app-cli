/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory,
} = require('enhanced-resolve');

// This enhanced resolver ensures that the code for a lib that is exposed is the
// same code that is used within the bundle. This bug would happen if an exposed
// lib had a module or browser field in addition to the main field in its
// package.json.

module.exports = function createResolver({ mainFields, resolveToContext = false }) {
  const enhancedResolver = ResolverFactory.createResolver({
    fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
    useSyncFileSystemCalls: true,
    extensions: ['.js', '.jsx', '.json'],
    mainFields,
    resolveToContext,
  });

  const trailingSlash = (process.platform === 'win32') ? '\\' : '/';
  // if resolveToContext add a trailing slash to indicate the value is a folder rather than  a file
  return (request) => `${enhancedResolver.resolveSync({}, __dirname, request)}${resolveToContext ? trailingSlash : ''}`;
};
