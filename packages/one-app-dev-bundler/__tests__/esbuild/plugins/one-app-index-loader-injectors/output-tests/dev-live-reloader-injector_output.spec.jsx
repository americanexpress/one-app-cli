/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { fromJS, Map as iMap } from 'immutable';
import path from 'path';
import fs from 'fs';
import React from 'react';
import { BUNDLE_TYPES } from '../../../../../esbuild/constants/enums';
import DevLiveReloaderInjector
  from '../../../../../esbuild/plugins/one-app-index-loader-injectors/dev-live-reloader-injector';
import createServerReloadFunction, { closeWebsocketServer } from '../../../../../esbuild/watch-server/watch-server';
// this needs to be a require, not an import. I _think_ this is because we are deep in a folder
// called exactly 'esbuild' so using import the ECMAScript module resolution looks for an index.js
// in that folder, finds nothing, and returns undefined. However the old style `require` looks for
// node_modules first.
const esbuild = require('esbuild');

const waitForConsoleLog = (logMessage) => new Promise((resolve, reject) => {
  const interval = setInterval(() => {
    const foundLogs = console.log.mock.calls.filter((call) => call[0] === logMessage);
    if (foundLogs.length > 0) {
      resolve();
    }
  }, 50);
  // reject after 1 second
  setTimeout(() => {
    clearInterval(interval);
    reject(new Error(`did not find '${logMessage}' after 1000ms`));
  }, 1000);
});

// The source code for the 'module' that we are bundling then testing in this file
const mockInitialModuleCode = `
import React from 'react';
import propTypes from 'prop-types';
const ModuleContainer = ({exampleProp}) => <p>Initial Module With Prop: {exampleProp}</p>;

ModuleContainer.propTypes = {
  exampleProp: propTypes.string.isRequired,
}

export default ModuleContainer;`;

// The source code for the 'module' after the user has made edits
const mockModifiedModuleCode = `
import React from 'react';
import propTypes from 'prop-types';
const ModuleContainer = ({exampleProp}) => <p>Edited Module With Prop: {exampleProp}</p>;

ModuleContainer.propTypes = {
  exampleProp: propTypes.string.isRequired,
}

export default ModuleContainer;`;

jest.spyOn(console, 'log');

describe('the output from dev-websocket-injector', () => {
  let InitialModuleContainer = null;
  let ModifiedModuleContainer = null;

  let reloadModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    // configure the injector
    const browserInjector = new DevLiveReloaderInjector({
      bundleType: BUNDLE_TYPES.BROWSER,
      watch: true,
      useLiveReload: true,
      packageJson: {
        name: 'mock-module-name',
      },
    });

    // Start a web socket server
    reloadModule = await createServerReloadFunction({ portStart: 51993, portMax: 52993 });

    // run the injector to generate the output code
    const unTranspiledInitialCode = await browserInjector.inject(mockInitialModuleCode, { rootComponentName: 'ModuleContainer' });
    const unTranspiledModifiedCode = await browserInjector.inject(mockModifiedModuleCode, { rootComponentName: 'ModuleContainer' });

    // build the code to transpile it to something we can import
    const transpiledInitialCode = (await esbuild.transform(unTranspiledInitialCode, { loader: 'jsx', format: 'cjs' })).code;
    const transpiledModifiedCode = (await esbuild.transform(unTranspiledModifiedCode, { loader: 'jsx', format: 'cjs' })).code;

    // polyfill browser things
    // Provided at runtime by one app core externals
    globalThis.Holocron = {
      getModuleMap: jest.fn(() => fromJS({
        modules: {
          'mock-module-name': {
            url: 'mockModuleUrl',
          },
        },
      })),
      forceLoadModule: jest.fn(async () => ModifiedModuleContainer),
    };
    // Provided at runtime by one app core externals
    globalThis.React = React;

    // Write the generated file to disk.
    // Save them in __test_fixtures__ so jest doesn't try to count coverage on them.
    await fs.promises.writeFile(path.join(__dirname, '../../__test_fixtures__/generated-initial-code.js'), transpiledInitialCode, 'utf-8');
    await fs.promises.writeFile(path.join(__dirname, '../../__test_fixtures__/generated-modified-code.js'), transpiledModifiedCode, 'utf-8');

    // Require the file to get a hold of the generated default export,this is what we want to test
    // eslint-disable-next-line global-require,import/no-unresolved -- requiring generated code must be done after its generated, it wil be un-resolved because it has not been generated yet
    InitialModuleContainer = require('../../__test_fixtures__/generated-initial-code.js').default;
    // eslint-disable-next-line global-require,import/no-unresolved -- requiring generated code must be done after its generated, it wil be un-resolved because it has not been generated yet
    ModifiedModuleContainer = require('../../__test_fixtures__/generated-modified-code.js').default;

    // Clean up
    await fs.promises.unlink(path.join(__dirname, '../../__test_fixtures__/generated-initial-code.js'));
    await fs.promises.unlink(path.join(__dirname, '../../__test_fixtures__/generated-modified-code.js'));
  });

  afterEach(() => {
    closeWebsocketServer();
  });

  it('should produce code that responds to a web socket message by asking holocron to force load the module, and then render that module in itself', async () => {
    expect.assertions(5);

    render(<InitialModuleContainer exampleProp="examplePropValue" />);

    expect(screen.getByText(/initial.*/i)).toHaveTextContent('Initial Module With Prop: examplePropValue');

    // Let websockets open and connect
    // Note: since this uses the real port durin the test. If port 51993 is not available
    // this test will fail. Check that you are not running the bundler anywhere
    await waitForConsoleLog('Watch Client 51993 | Connected');

    jest.useFakeTimers();

    act(() => {
      // Tell the Web Socket Server to tell the module to reload itself
      reloadModule();
      jest.runAllTimers();
    });

    jest.useRealTimers();

    // Let websockets send and receive messages
    await waitForConsoleLog('Watch Client 51993 | Successfully reloaded mock-module-name');

    expect(screen.getByText(/edited.*/i)).toHaveTextContent('Edited Module With Prop: examplePropValue');

    expect(globalThis.Holocron.forceLoadModule).toHaveBeenCalledTimes(1);
    expect(globalThis.Holocron.forceLoadModule).toHaveBeenCalledWith('mock-module-name', iMap({ url: 'mockModuleUrl' }));

    expect(console).toHaveLogs([
      'Watch Server | Started on port 51993',
      'Watch Client 51993 | Connected',
      'Watch Server | Reload clients',
      'Watch Client 51993 | Successfully reloaded mock-module-name',
      'Watch Client 51993 | Connected',
    ]);
  });
});
