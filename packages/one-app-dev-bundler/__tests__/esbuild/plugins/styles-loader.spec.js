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
import sass from 'sass';
import stylesLoader from '../../../esbuild/plugins/styles-loader';
import { runSetupAndGetLifeHooks, runOnLoadHook } from './__plugin-testing-utils__';
import {
  BUNDLE_TYPES,
} from '../../../esbuild/constants/enums.js';
import getModulesBundlerConfig from '../../../esbuild/utils/get-modules-bundler-config';

jest.mock('../../../esbuild/utils/get-modules-bundler-config', () => jest.fn(() => false));

jest.mock('glob-all');

jest.mock('cssnano');

jest.spyOn(sass, 'compile');

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

          expect(sass.compile).toHaveBeenCalledTimes(1);
          expect(sass.compile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

          expect(loader).toEqual('js');
          expect(contents).toMatchInlineSnapshot(`
"const digest = 'c0c0c0be320475d1514fe8e0c023d2780b6e23c2adab14a438a0ee2ef98369ba';
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

          expect(sass.compile).toHaveBeenCalledTimes(0);
          expect(loader).toEqual('js');
          expect(contents).toMatchInlineSnapshot(`
"const digest = '83279c4025e8b1107c3f376acaaac5656a3b68d0066ab70f2ceeb3c065a5751f';
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

        expect(sass.compile).toHaveBeenCalledTimes(1);
        expect(sass.compile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = 'c0c0c0be320475d1514fe8e0c023d2780b6e23c2adab14a438a0ee2ef98369ba';
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

        expect(sass.compile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '83279c4025e8b1107c3f376acaaac5656a3b68d0066ab70f2ceeb3c065a5751f';
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

        expect(sass.compile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '786f696ae19422021e0f17df7c6dd6eb43f92c9c101f7d0649b341165dda1b31';
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

        expect(sass.compile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '786f696ae19422021e0f17df7c6dd6eb43f92c9c101f7d0649b341165dda1b31';
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

      it('should transform inputs to outputs for scss, with purge disabled, in the browser', async () => {
        expect.assertions(4);

        getModulesBundlerConfig.mockImplementation(() => ({
          disabled: true,
        }));

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

        expect(sass.compile).toHaveBeenCalledTimes(1);
        expect(sass.compile).toHaveBeenCalledWith(`mock/path/to/file/${mockFileName}`, { loadPaths: ['./node_modules'] });

        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = 'c0c0c0be320475d1514fe8e0c023d2780b6e23c2adab14a438a0ee2ef98369ba';
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

        getModulesBundlerConfig.mockImplementation(() => ({
          disabled: true,
        }));

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

        expect(sass.compile).toHaveBeenCalledTimes(0);
        expect(loader).toEqual('js');
        expect(contents).toMatchInlineSnapshot(`
"const digest = '83279c4025e8b1107c3f376acaaac5656a3b68d0066ab70f2ceeb3c065a5751f';
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
