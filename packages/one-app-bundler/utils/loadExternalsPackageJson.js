/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
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

// Because this file uses very modern node features, it may not be parsed by every IDE.
// As long as eslint and jest are happy when they are run by yarn, all is ok.
const loadExternalsPackageJson = async (externalName) => (await import(`${externalName}/package.json`, { assert: { type: "json" } })).default;

export default loadExternalsPackageJson;
