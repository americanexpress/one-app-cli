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

import 'regenerator-runtime/runtime';
// eslint-disable-next-line import/no-extraneous-dependencies -- eslint thinks this should be in deps, not dev deps
import '@testing-library/jest-dom/extend-expect';

function consoleMatcher({
  funcName, matcherName, console, expectedMessages: rawExpectedMessages,
}) {
  const calls = console?.[funcName]?.mock?.calls;
  const expectedMessages = rawExpectedMessages?.map(
    (expectedMsg) => (Array.isArray(expectedMsg)
      ? expectedMsg
      : [expectedMsg]));

  // ensure jest.spyOn(console, 'log'); was called
  if (!calls || !Array.isArray(calls)) {
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
Expected first parameter to be a console with a mocked '${funcName}' function. Did you call 'jest.spyOn(console, '${funcName}');'?`,
      pass: false,
    };
  }

  // protect against expect(console).toHaveLogs(). Suggest expect(console).not.toHaveLogs()
  if (!Array.isArray(expectedMessages) && !this.isNot) {
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
No messages were passed to 'expect(console).${matcherName}()'. Did you mean 'expect(console).not.${matcherName}()'`,
      pass: false,
    };
  }

  // protect against expect(console).not.toHaveLogs([...messages]).
  // Suggest expect(console).toHaveLogs([...messages])
  if (Array.isArray(expectedMessages) && this.isNot) {
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
Messages were passed to 'expect(console).not.${matcherName}([...messages])'. Did you mean 'expect(console).${matcherName}([...messages])'`,
      pass: true,
    };
  }

  // if no messages were passed, expect none
  if (!Array.isArray(expectedMessages)) {
    if (calls.length > 0) {
      return {
        message: () => `${this.utils.matcherHint(matcherName, 'console')}
Expected not to have calls but received ${calls.length}.
Received: 
${calls.map((call) => `    console.${funcName}('${call}')`).join('\n')}`,
        pass: true,
      };
    }
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
Expected to have calls but received 0.`,
      pass: false,
    };
  }

  // If arrays are different lengths
  // Still log all the expected and received to help users resolve easier
  if (calls.length !== expectedMessages.length) {
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
Expected ${expectedMessages.length} ${funcName} calls but received ${calls.length}. The passed array length must match the number of calls to console.${funcName}.
Expected:
${expectedMessages.map((call) => `    '${call}'`).join('\n')}
Received: 
${calls.map((call) => `    console.${funcName}('${call}')`).join('\n')}`,
      pass: false,
    };
  }

  // Finally, if the arrays are the same length, highlight the differences.
  const expectMessages = expectedMessages
    .map((expectedMessage, index) => `  for call ${index}:
  Expected: ${this.utils.printExpected(JSON.stringify(expectedMessage))}
  Received: ${this.utils.printReceived(JSON.stringify(calls[index]))}
`).filter((_v, index) => JSON.stringify(expectedMessages[index]) !== JSON.stringify(calls[index])); // Note: filter needs to go after map because of "calls[index]"

  if (expectMessages.length > 0) {
    return {
      message: () => `${this.utils.matcherHint(matcherName, 'console')}
${expectMessages.join('')}`,
      pass: false,
    };
  }

  return {
    message: () => 'The test found no errors', // this message should never be seen
    pass: !this.isNot, // ensure the test passes even with .not
  };
}

// eslint-disable-next-line no-undef -- eslint doesnt understand this file is run under the jest runtime
expect.extend({
  toHaveLogs(console, expectedMessages) {
    return consoleMatcher.call(this, {
      console, expectedMessages, funcName: 'log', matcherName: 'toHaveLogs',
    });
  },
  toHaveErrors(console, expectedMessages) {
    return consoleMatcher.call(this, {
      console, expectedMessages, funcName: 'error', matcherName: 'toHaveErrors',
    });
  },
  toHaveWarnings(console, expectedMessages) {
    return consoleMatcher.call(this, {
      console, expectedMessages, funcName: 'warn', matcherName: 'toHaveWarnings',
    });
  },
  toHaveInfo(console, expectedMessages) {
    return consoleMatcher.call(this, {
      console, expectedMessages, funcName: 'info', matcherName: 'toHaveInfo',
    });
  },
});
