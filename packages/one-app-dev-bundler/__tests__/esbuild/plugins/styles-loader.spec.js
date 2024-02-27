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

import glob from 'glob-all';
import { compile as sassCompile } from 'sass';
import stylesLoader from '../../../esbuild/plugins/styles-loader';
import { runSetupAndGetLifeHooks, runOnLoadHook } from './__plugin-testing-utils__';
import {
  BUNDLE_TYPES,
} from '../../../esbuild/constants/enums.js';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';

jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn(() => false));

jest.mock('glob-all');

jest.mock('cssnano');

// sass has different loaders for CJS and ESM, the latter does not have a "default" export
// making `import sass from 'sass';` throw an error
// Jest is still working on ESM mocking https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
// so there is a divergance from this test setup and sass versions: update this setup once the jest
// API is stable
jest.mock('sass', () => {
  const sass = jest.requireActual('sass');
  jest.spyOn(sass, 'compile');
  return sass;
});

const mockNodeEnv = (env) => {
  let oldEnv;

  beforeEach(() => {
    oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv;
  });
};

describe('Esbuild plugin stylesLoader', () => {
  mockNodeEnv('development');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function that returns a plugin with the correct name', () => {
    const plugin = stylesLoader();
    expect(plugin.name).toBe('stylesLoader');
  });

  describe('setup function', () => {
    it('should register an onLoad hook, with the right filters, for browser bundles', () => {
      const plugin = stylesLoader({}, { bundleType: BUNDLE_TYPES.BROWSER });
      const lifeCycleHooks = runSetupAndGetLifeHooks(plugin);

      expect(lifeCycleHooks.onLoad.length).toBe(1);
      expect(lifeCycleHooks.onLoad[0].config).toEqual({ filter: /.s?css$/ });
    });
  });

  describe('lifecycle Hooks', () => {
    describe('onLoad', () => {
      describe('NON-PRODUCTION environment', () => {
        mockNodeEnv('development');

        it('should transform inputs to outputs for scss, in the browser', async () => {
          expect.assertions(4);

          const mockFileName = 'index.scss';
          const mockFileContent = `body {
  background: white;

  & > p {
    font-color: black;
  }
}`;

          const plugin = stylesLoader({}, {
            bundleType: BUNDLE_TYPES.BROWSER,
          });
          const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

          const { contents, loader } = await runOnLoadHook(
            onLoadHook,
            { mockFileName, mockFileContent }
          );

          expect(sassCompile).toHaveBeenCalledTimes(1);
          expect(sassCompile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

          expect(loader).toEqual('js');
          expect(contents).toMatchInlineSnapshot(`
"const digest = '5e9583e668d7632ccabf75f612a320b29f5f48cd7a7e86489c7b0f8f5fdcdbbe';
const css = \`body {
  background: white;
}
body > p {
  font-color: black;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();

export default {  };
export { css, digest };"
`);
        });

        it('should transform inputs to outputs for css, in the browser', async () => {
          expect.assertions(3);

          const mockFileName = 'index.css';
          const mockFileContent = `body {
  background: white;
}
body > p {
  font-color: black;
}`;

          const plugin = stylesLoader({}, {
            bundleType: BUNDLE_TYPES.BROWSER,
          });
          const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

          const { contents, loader } = await runOnLoadHook(
            onLoadHook,
            { mockFileName, mockFileContent }
          );

          expect(sassCompile).toHaveBeenCalledTimes(0);
          expect(loader).toEqual('js');
          expect(contents).toMatchInlineSnapshot(`
"const digest = '5e9583e668d7632ccabf75f612a320b29f5f48cd7a7e86489c7b0f8f5fdcdbbe';
const css = \`body {
  background: white;
}
body > p {
  font-color: black;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();

export default {  };
export { css, digest };"
`);
        });
      });

      it('should transform inputs to outputs for scss, in the server', async () => {
        expect.assertions(4);

        const mockFileName = 'index.scss';
        const mockFileContent = `body {
  background: white;
}
body > p {
  font-color: black;
}`;

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(
          onLoadHook,
          { mockFileName, mockFileContent }
        );

        expect(sassCompile).toHaveBeenCalledTimes(1);
        expect(sassCompile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '11e1fda0219a10c2de0ad6b28c1c6519985965cbef3f5b8f8f119d16f1bafff3';
const css = \`body {
  background: white;
}

body > p {
  font-color: black;
}\`;


export default {  };
export { css, digest };"
`);
      });

      it('should transform inputs to outputs for css, in the server', async () => {
        expect.assertions(3);

        const mockFileName = 'index.css';
        const mockFileContent = `body {
  background: white;
}
body > p {
  font-color: black;
}`;

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.SERVER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(
          onLoadHook,
          { mockFileName, mockFileContent }
        );

        expect(sassCompile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '5e9583e668d7632ccabf75f612a320b29f5f48cd7a7e86489c7b0f8f5fdcdbbe';
const css = \`body {
  background: white;
}
body > p {
  font-color: black;
}\`;


export default {  };
export { css, digest };"
`);
      });
    });

    describe('PRODUCTION environment', () => {
      mockNodeEnv('production');

      it('should transform inputs to default outputs for purged css, browser', async () => {
        glob.sync.mockReturnValue(['Test.jsx']);

        getModulesBundlerConfig.mockImplementationOnce(() => ({
          disabled: false,
        }));

        expect.assertions(3);

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;
        const additionalMockedFiles = {
          'Test.jsx': `\
            import styles from './index.module.css';

            const Component = () => {
              return (
                <div className={styles.root}>
                  <p className={styles.second}>Testing</p>
                </div>
              );
            }

            export default Component`,
        };

        const {
          contents, loader,
        } = await runOnLoadHook(
          onLoadHook,
          {
            mockFileNAme: 'index.module.css',
            mockFileContent: `\
              .root {
                background: white;
              }

              .somethingElse {
                font-color: lime;
              }

              .second {
                font-color: black;
              }`,
          },
          additionalMockedFiles
        );

        expect(sassCompile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = 'f85b3a3cf0c00eb3fd23e6d440b10077d7493cf7f127538acb994cade5bce451';
const css = \`              ._root_1vf0l_1 {
                background: white;
              }

              ._second_1vf0l_9 {
                font-color: black;
              }\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
export const root = '_root_1vf0l_1';
export const second = '_second_1vf0l_9';
export default { root, second };
export { css, digest };"
`);
      });

      it('should transform inputs to named outputs for purged css, browser', async () => {
        glob.sync.mockReturnValue(['Test.jsx']);

        getModulesBundlerConfig.mockImplementationOnce(() => ({
          disabled: false,
        }));

        expect.assertions(3);

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;
        const additionalMockedFiles = {
          'Test.jsx': `\
            import { root, second } from './index.module.css';

            const Component = () => {
              return (
                <div className={root}>
                  <p className={second}>Testing</p>
                </div>
              );
            }

            export default Component`,
        };

        const {
          contents, loader,
        } = await runOnLoadHook(
          onLoadHook,
          {
            mockFileNAme: 'index.module.css',
            mockFileContent: `\
              .root {
                background: white;
              }

              .somethingElse {
                font-color: lime;
              }

              .second {
                font-color: black;
              }`,
          },
          additionalMockedFiles
        );

        expect(sassCompile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = 'f85b3a3cf0c00eb3fd23e6d440b10077d7493cf7f127538acb994cade5bce451';
const css = \`              ._root_1vf0l_1 {
                background: white;
              }

              ._second_1vf0l_9 {
                font-color: black;
              }\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
export const root = '_root_1vf0l_1';
export const second = '_second_1vf0l_9';
export default { root, second };
export { css, digest };"
`);
      });

      it('should transform inputs to outputs for scss, in the browser', async () => {
        expect.assertions(4);

        const mockFileName = 'index.scss';
        const mockFileContent = `body {
  background: white;

  & > p {
    font-color: black;
  }
}`;

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(
          onLoadHook,
          { mockFileName, mockFileContent }
        );

        expect(sassCompile).toHaveBeenCalledTimes(1);
        expect(sassCompile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '5e9583e668d7632ccabf75f612a320b29f5f48cd7a7e86489c7b0f8f5fdcdbbe';
const css = \`body {
  background: white;
}
body > p {
  font-color: black;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();

export default {  };
export { css, digest };"
`);
      });

      it('should transform inputs to outputs for css, in the browser', async () => {
        expect.assertions(3);

        const mockFileName = 'index.css';
        const mockFileContent = `body {
  background: white;
}
body > p {
  font-color: black;
}`;

        const plugin = stylesLoader({}, {
          bundleType: BUNDLE_TYPES.BROWSER,
        });
        const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

        const { contents, loader } = await runOnLoadHook(
          onLoadHook,
          { mockFileName, mockFileContent }
        );

        expect(sassCompile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '5e9583e668d7632ccabf75f612a320b29f5f48cd7a7e86489c7b0f8f5fdcdbbe';
const css = \`body {
  background: white;
}
body > p {
  font-color: black;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();

export default {  };
export { css, digest };"
`);
      });
    });
  });
});
