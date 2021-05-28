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

import fs from 'fs';
import path from 'path';
import { Union } from 'unionfs';
import { Volume, createFsFromVolume } from 'memfs';

export const volume = new Volume();
export const vfs = createFsFromVolume(volume);
vfs.join = path.join.bind(path);

export const ufs = new Union();
// union of virtual fs and real fs
ufs.use(fs).use(vfs);
ufs.join = path.join.bind(path);
