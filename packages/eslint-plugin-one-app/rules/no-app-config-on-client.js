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

const get = require('lodash/get');

module.exports = {
  create(context) {
    const getParentIfStatementNode = (node) => {
      if (node.type === 'IfStatement') {
        return node;
      }

      if (node.type === 'Program') {
        return false;
      }
      return getParentIfStatementNode(node.parent);
    };
    return {
      '[name=appConfig]': (node) => {
        const isMemberExpression = get(node, 'parent.type', undefined) === 'MemberExpression';
        // TODO: validate that it is also a member of module. How?
        if (isMemberExpression) {
          const foundIfStatementNode = getParentIfStatementNode(node.parent);
          if (
            !(
              get(foundIfStatementNode, 'test.operator', '') === '!'
                && get(foundIfStatementNode, 'test.argument.type', '') === 'MemberExpression'
                && get(foundIfStatementNode, 'test.argument.object.name', '') === 'global'
                && get(foundIfStatementNode, 'test.argument.property.name', '') === 'BROWSER'
            )
          ) {
            context.report({
              node,
              message: 'A Holocron module\'s appConfig should be wrapped in `if(!global.BROWSER) {}`',
            });
          }
        }
      },
    };
  },
};
