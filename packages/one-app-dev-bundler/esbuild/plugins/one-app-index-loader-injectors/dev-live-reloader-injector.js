import { BUNDLE_TYPES } from '../../constants/enums.js';
import { getWatchServerPort } from '../../watch-server/watch-server.js';

export default class DevLiveReloaderInjector {
  constructor({
    bundleType, watch, useLiveReload, packageJson,
  }) {
    this.willInject = watch && useLiveReload && bundleType === BUNDLE_TYPES.BROWSER;
    this.moduleName = packageJson.name;
  }

  inject = async (content, { rootComponentName }) => {
    if (!this.willInject) {
      return content;
    }

    return content.replace(
      `export default ${rootComponentName};`,
      `
// Fall back to a simple module loader if \`Holocron.forceLoadModule\` is not available
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

// We are storing the latest module in the module scope instead of in react useState so that
// a full re-render of a parent module will not cause child modules to 'rollback' to their
// original code
let LatestModule = ${rootComponentName};

const LiveModuleContainer = (props) => {
  const [loadCount, setLoadCount] = React.useState(0);

  const loadNextModule = async () => {
    const moduleData = globalThis.Holocron.getModuleMap().getIn(['modules', '${this.moduleName}']);
    const nextModule = await loadModule('${this.moduleName}', moduleData);
    if (nextModule.LiveWrappedModule) {
      console.log(\`Watch Client ${getWatchServerPort()} | Successfully reloaded ${this.moduleName}\`);
      // Access the original root component to prevent extra layers of nesting
      LatestModule = nextModule.LiveWrappedModule;
      // load count causes a complete re-render whenever a new module instance is loaded
      setLoadCount((prevState) => prevState + 1);
    } else {
      console.warn('Watch Client ${getWatchServerPort()} | We tried to reload a live module but did not get a live module in return');
    }
  };

  globalThis.React.useEffect(() => {
    let isOpen = false;
    let shouldClose = false;
    const ws = new WebSocket('ws://localhost:${getWatchServerPort()}/socket');
    ws.onmessage = () => {
      loadNextModule();
    };

    ws.onopen = () => {
      isOpen = true;
      // Cleanup was called before we could open, close immediately
      if (shouldClose) {
        ws.close();
      } else {
        console.log('Watch Client ${getWatchServerPort()} | Connected');
      }
    }

    ws.addEventListener('error', (error) => {
      console.log('Watch Client ${getWatchServerPort()} | There was an error connecting to the Watch Server:');
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
hoistNonReactStatics(LiveModuleContainer, ${rootComponentName});

// store the original ModuleContainer so we can bypass the LiveModuleContainer later
LiveModuleContainer.LiveWrappedModule = ${rootComponentName};

// finally export the LiveModuleContainer instead of the ModuleContainer
export default LiveModuleContainer;
`);
  }
}
