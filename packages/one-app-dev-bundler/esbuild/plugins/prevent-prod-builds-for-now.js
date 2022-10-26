/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

const preventProdBuildsForNow = {
  name: 'preventProdBuildsForNow',
  setup() {
    if (process.env.NODE_ENV !== 'development') {
      console.error(`
  _____ _______ ____  _____  
 / ____|__   __/ __ \\|  __ \\ 
| (___    | | | |  | | |__) |
 \\___ \\   | | | |  | |  ___/ 
 ____) |  | | | |__| | |     
|_____/   |_|  \\____/|_|     

This bundler is only enabled for local development. If you see this message please raise an issue`);
      // eslint-disable-next-line unicorn/no-process-exit -- This is a cli app.
      process.exit(2);
    }
  },
};

export default preventProdBuildsForNow;
