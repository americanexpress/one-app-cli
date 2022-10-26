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

// In the browser the 'core' externals are exported to the global variable,
const browserGlobals = { // Relevant webpack list: ../webpack/common.js:~l102
  '@americanexpress/one-app-router': {
    varName: 'OneAppRouter',
    type: 'cjs',
  },
  'create-shared-react-context': {
    varName: 'CreateSharedReactContext',
    type: 'cjs',
  },
  holocron: {
    varName: 'Holocron',
    type: 'cjs',
  },
  react: {
    varName: 'React',
    type: 'cjs',
  },
  'react-dom': {
    varName: 'ReactDOM',
    type: 'cjs',
  },
  redux: {
    varName: 'Redux',
    type: 'cjs',
  },
  'react-redux': {
    varName: 'ReactRedux',
    type: 'cjs',
  },
  reselect: {
    varName: 'Reselect',
    type: 'cjs',
  },
  immutable: {
    varName: 'Immutable',
    type: 'cjs',
  },
  '@americanexpress/one-app-ducks': {
    varName: 'OneAppDucks',
    type: 'cjs',
  },
  'holocron-module-route': {
    varName: 'HolocronModuleRoute',
    type: 'cjs',
  },
  'prop-types': {
    varName: 'PropTypes',
    type: 'cjs',
  },
  'react-helmet': {
    varName: 'ReactHelmet',
    type: 'cjs',
  },
};

// In node, we can just require them at runtime, so we just need the package names
const nodeExternals = Object.keys(browserGlobals);

const getOneAppExternals = () => ({ browserGlobals, nodeExternals });

export default getOneAppExternals;
