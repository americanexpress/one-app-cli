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

import fs from 'fs';
import * as acorn from 'acorn';
import * as astWalker from 'acorn-walk';
import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';
import { logErrors, logWarnings } from '../utils/colorful-logging.js';
import { BUNDLE_TYPES, SEVERITY } from '../constants/enums.js';

// a lodash like get function
const get = (value, path, defaultValue) => String(path).split('.').reduce((acc, v) => {
  try {
    return acc[v];
  } catch (e) {
    return defaultValue;
  }
}, value);

export const getParentNode = (ancestorArray, nodeType) => {
  if (!Array.isArray(ancestorArray)) {
    return undefined;
  }

  // ancestors are stored backwards. The last ancestor is the closest parent
  for (let i = ancestorArray.length - 1; i >= 0; i -= 1) {
    if (ancestorArray[i].type === nodeType) {
      return ancestorArray[i];
    }
  }

  return undefined;
};

// Check if a node's ansectors contains an `if(false) {}` statement
const isNodeInFalseIf = (ancestors) => {
  const foundIfStatementNode = getParentNode(ancestors, 'IfStatement');
  return (
    get(foundIfStatementNode, 'test.type', '') === 'Literal'
    && get(foundIfStatementNode, 'test.raw', '') === 'false'
  );
};

// Check that the code is exactly as below,
// as that's what the provided externals code generates:
// ```
//   <object>.appConfig = Object.assign({}, <object>.appConfig, {
//     providedExternals: {
//       ...
//     }
//   });
// ```
// eslint-disable-next-line no-extra-parens -- to facilitate code formatting with comments
const isProvidingExternals = (node) => (
  // check left side is assigning to appConfig
  get(node, 'left.type', '') === 'MemberExpression'
  && get(node, 'left.property.name', '') === 'appConfig'
  // check right side is a call to object.assign
  && get(node, 'right.type', '') === 'CallExpression'
  && get(node, 'right.callee.type', '') === 'MemberExpression'
  && get(node, 'right.callee.object.name', '') === 'Object'
  && get(node, 'right.callee.property.name', '') === 'assign'
  // check Parameters of object assigne
  // param 1 is an empty object
  && get(node.right.arguments[0], 'type', '') === 'ObjectExpression'
  && node.right.arguments[0].properties.length === 0
  // param 2 is appConfig
  && get(node.right.arguments[1], 'type', '') === 'MemberExpression'
  && get(node.right.arguments[1], 'property.name', '') === 'appConfig'
  // param 3 is an object with the 'providedExternals' key only
  && get(node.right.arguments[2], 'type', '') === 'ObjectExpression'
  && node.right.arguments[2].properties.length === 1
  && get(node.right.arguments[2], 'properties.0.key.name', '') === 'providedExternals'
);

// Check that the code is exactly as below,
// as that's what the requires externals code generates:
// ```
//   globalThis.getTenantRootModule().appConfig.providedExternals....;
// ```
const isRequiringExternals = (node, ancestors) => get(node, 'object.callee.object.name', '') === 'globalThis'
  && get(node, 'object.callee.property.name', '') === 'getTenantRootModule'
  && get(ancestors[ancestors.length - 2], 'property.name', '') === 'providedExternals';

// Check if the node is used for either externals system
const isNodeForExternals = (node, ancestors) => {
  if (isRequiringExternals(node, ancestors)) {
    return true;
  }

  // when checking if we are providing externals with this expression, we want to go up
  // to the assignment as it's the 'root' node for the entire expression we want to check
  const assignmentNode = getParentNode(ancestors, 'AssignmentExpression');
  return isProvidingExternals(assignmentNode);
};

const validateAppConfig = (moduleString) => {
  const messages = [];
  const ast = acorn.parse(moduleString, { ecmaVersion: 'latest' });

  astWalker.ancestor(ast, {
    MemberExpression(node, ancestors) {
      if (node.property.name === 'appConfig') {
        const usageCorrect = isNodeInFalseIf(ancestors) || isNodeForExternals(node, ancestors);
        if (!usageCorrect) {
          messages.push('A Holocron module\'s appConfig should be wrapped in `if(!global.BROWSER) {}`');
        }
      }
    },
  });
  return messages;
};

const restrictRuntimeSymbols = ({ severity, bundleType }) => ({
  name: 'restrictRuntimeSymbols',
  setup(build) {
    build.onEnd(async (result) => {
      const fileNames = getJsFilenamesFromKeys(result.metafile.outputs);
      const isBrowser = bundleType === BUNDLE_TYPES.BROWSER;
      // eslint-disable-next-line no-restricted-syntax -- traditional for loop for looped async work
      for (const fileName of fileNames) {
        // eslint-disable-next-line no-await-in-loop -- await in loop makes this code simpler. The implications of blocking the main thread are moot in this context
        const moduleString = await fs.promises.readFile(fileName, 'utf8');
        const messages = [];
        if (isBrowser && moduleString.match(/.appConfig/)) {
          validateAppConfig(moduleString).forEach((message) => messages.push(message));
        }
        if (moduleString.match(/create-react-class/)) {
          messages.push('`create-react-class` is restricted from being used');
        }

        const messagesLength = messages.length;
        if (messagesLength > 0) {
          if (severity === SEVERITY.ERROR) {
            logErrors(messages);
            throw new Error(`${messagesLength} ${messagesLength === 1 ? 'error' : 'errors'} found. Please check logs.`);
          } else {
            logWarnings(messages);
          }
        }
      }
    });
  },
});

export default restrictRuntimeSymbols;
