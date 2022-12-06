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

const ModuleRootComponent = ({children}) => (
  <div>
    {children}
  </div>
);


// Fall back to a simple module loader if `Holocron.forceLoadModule` is not available
const loadModule = globalThis.Holocron.forceLoadModule || ((moduleName, moduleData) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-underscore-dangle -- runtime symbol reference
  const url = moduleData.getIn([window.__holocron_module_bundle_type__, 'url']);

  const head = globalThis.document.querySelectorAll('head')[0];
  const script = globalThis.document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.async = true;
  script.timeout = 120000;
  script.crossOrigin = 'anonymous';
  script.src = url;

  script.addEventListener('error', (event) => {
    reject(event.message);
  });

  script.addEventListener('load', () => {
    resolve(globalThis.Holocron.getModule(moduleName));
  });

  head.appendChild(script);
}));

// This variable will store the latest module in the module scope instead of in react useState so that
// a full re-render of a parent module will not cause child modules to 'rollback' to their
// original code
let LatestModule = ModuleRootComponent;

const LiveModuleContainer = (props) => {
  const [loadCount, setLoadCount] = React.useState(0);

  const loadNextModule = async () => {
    const moduleData = globalThis.Holocron.getModuleMap().getIn(['modules', 'axp-mock-module-name']);
    const nextModule = await loadModule('axp-mock-module-name', moduleData);
    if (nextModule.LiveWrappedModule) {
      console.log(`Watch Client null | Successfully reloaded axp-mock-module-name`);
      // Access the original root component to prevent extra layers of nesting
      LatestModule = nextModule.LiveWrappedModule;
      // load count causes a complete re-render whenever a new module instance is loaded
      setLoadCount((prevState) => prevState + 1);
    } else {
      console.warn('Watch Client null | The watch client tried to reload a live module but did not get a live module in return');
    }
  };

  globalThis.React.useEffect(() => {
    let isOpen = false;
    let shouldClose = false;
    const ws = new WebSocket('ws://localhost:null/socket');
    ws.onmessage = () => {
      loadNextModule();
    };

    ws.onopen = () => {
      isOpen = true;
      // Cleanup was called before the socket could open, close immediately
      if (shouldClose) {
        ws.close();
      } else {
        console.log('Watch Client null | Connected');
      }
    }

    ws.addEventListener('error', (error) => {
      console.log('Watch Client null | There was an error connecting to the Watch Server:');
      console.error(error);
    });

    return () => {
      if (isOpen) {
        ws.close();
      } else {
        // closing before its open causes errors
        shouldClose = true;
      }
    };
  });

  return <LatestModule {...props} key={loadCount}  />;
};

// Preserve anything attached to the top level component
const hoistNonReactStatics = require('hoist-non-react-statics');
hoistNonReactStatics(LiveModuleContainer, ModuleRootComponent);

// store the original ModuleContainer so the LiveModuleContainer can be bypassed later
LiveModuleContainer.LiveWrappedModule = ModuleRootComponent;

// finally export the LiveModuleContainer instead of the ModuleContainer
export default LiveModuleContainer;

;
LiveModuleContainer.appConfig = Object.assign({}, LiveModuleContainer.appConfig, {
  providedExternals: {
    'external-package-1': { version: '1.2.3', module: require('external-package-1')},
  'external-package-2': { version: '4.5.6', module: require('external-package-2')},
  },
});

if(globalThis.getTenantRootModule === undefined || (globalThis.rootModuleName && globalThis.rootModuleName === 'axp-mock-module-name')){
globalThis.getTenantRootModule = () => LiveModuleContainer;
globalThis.rootModuleName = 'axp-mock-module-name';
}
;
Holocron.registerModule("axp-mock-module-name", LiveModuleContainer);
