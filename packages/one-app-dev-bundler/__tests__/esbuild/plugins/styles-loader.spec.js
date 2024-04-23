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

        it('should transform inputs to default outputs for purged css, browser', async () => {
          glob.sync.mockReturnValue(['Test.jsx']);

          getModulesBundlerConfig.mockImplementationOnce(() => ({
            enabled: true,
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
              mockFileName: 'index.module.css',
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
"const digest = 'be76540996d2256b09af85f09bb93016999ae115235d972319628c011a06d6cc';
const css = \`                ._root_w8zvp_1 {
                  background: white;
                }
  
                ._second_w8zvp_9 {
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
module.exports = { 'root': '_root_w8zvp_1', 'second': '_second_w8zvp_9' }
module['css'] = css;
module['digest'] = digest;"
`
          );
        });

        it('should transform inputs to named outputs for purged css, browser', async () => {
          glob.sync.mockReturnValue(['Test.jsx']);

          getModulesBundlerConfig.mockImplementationOnce(() => ({
            enabled: true,
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
              mockFileName: 'index.module.css',
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
"const digest = 'be76540996d2256b09af85f09bb93016999ae115235d972319628c011a06d6cc';
const css = \`                ._root_w8zvp_1 {
                  background: white;
                }
  
                ._second_w8zvp_9 {
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
module.exports = { 'root': '_root_w8zvp_1', 'second': '_second_w8zvp_9' }
module['css'] = css;
module['digest'] = digest;"
`
          );
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
module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
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
module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
`);
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

module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
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

module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
`);
        });

        describe('css classes', () => {
          const mockFileContent = `
.test-class {
  background: white;
}
.test-class .nested-class {
  font-color: black;
}`;

          it('should hash the css classes for .scss files not in node_modules', async () => {
            expect.assertions(4);

            const mockFileName = 'index.scss';
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
"const digest = 'e7f5b9ef03f087455b4d224d28209638e7d986130a45e94f793690dbac47dc39';
const css = \`._test-class_1o1cd_1 {
  background: white;
}

._test-class_1o1cd_1 ._nested-class_1o1cd_5 {
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
module.exports = { 'test-class': '_test-class_1o1cd_1', 'nested-class': '_nested-class_1o1cd_5' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should hash the css classes for .css files not in node_modules', async () => {
            expect.assertions(3);

            const mockFileName = 'index.css';
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
"const digest = 'ce462c133ed89a8b7ce350c3aef04277cf1b8b618dfad088d668c2ed0f5209a7';
const css = \`
._test-class_ykkej_2 {
  background: white;
}
._test-class_ykkej_2 ._nested-class_ykkej_5 {
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
module.exports = { 'test-class': '_test-class_ykkej_2', 'nested-class': '_nested-class_ykkej_5' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should hash the css classes for .module.scss files in node_modules', async () => {
            expect.assertions(4);

            const mockFileName = 'node_modules/index.module.scss';
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
"const digest = 'e7f5b9ef03f087455b4d224d28209638e7d986130a45e94f793690dbac47dc39';
const css = \`._test-class_1o1cd_1 {
  background: white;
}

._test-class_1o1cd_1 ._nested-class_1o1cd_5 {
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
module.exports = { 'test-class': '_test-class_1o1cd_1', 'nested-class': '_nested-class_1o1cd_5' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should hash the css classes for .module.css files in node_modules', async () => {
            expect.assertions(3);

            const mockFileName = 'index.css';
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
"const digest = 'ce462c133ed89a8b7ce350c3aef04277cf1b8b618dfad088d668c2ed0f5209a7';
const css = \`
._test-class_ykkej_2 {
  background: white;
}
._test-class_ykkej_2 ._nested-class_ykkej_5 {
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
module.exports = { 'test-class': '_test-class_ykkej_2', 'nested-class': '_nested-class_ykkej_5' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should not hash the css classes for .scss files in node_modules', async () => {
            expect.assertions(4);

            const mockFileName = 'node_modules/index.scss';
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
"const digest = 'ade268ae3555b997b1a7c7fd6c3c2f4b8f1b2e4f6a79011c4d01a82b1a6df8bd';
const css = \`.test-class {
  background: white;
}

.test-class .nested-class {
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
module.exports = { 'test-class': 'test-class', 'nested-class': 'nested-class' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should not hash the css classes for .css files in node_modules', async () => {
            expect.assertions(3);

            const mockFileName = 'node_modules/index.css';
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
"const digest = '46b2c9f3228391651835f4f0819eebe700536d488ddb9d523e826d2368427eb0';
const css = \`
.test-class {
  background: white;
}
.test-class .nested-class {
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
module.exports = { 'test-class': 'test-class', 'nested-class': 'nested-class' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });
        });

        describe('css module class name mapping', () => {
          it('should map camelCase class names to camelCase export', async () => {
            expect.assertions(1);
            const mockFileContentCamelCase = `
.testClass {
  background: white;
}`;

            const mockFileName = 'index.module.css';
            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

            const { contents } = await runOnLoadHook(
              onLoadHook,
              { mockFileName, mockFileContent: mockFileContentCamelCase }
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = '226b4f2da43972a4fc06e45959f141575ff54d5112c560f4e9317565d5f7f7e3';
const css = \`
._testClass_nd9j1_2 {
  background: white;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
module.exports = { 'testClass': '_testClass_nd9j1_2' }
module['css'] = css;
module['digest'] = digest;"
`);
          });

          it('should map kebab-case class names to kebab-case export', async () => {
            expect.assertions(1);
            const mockFileContentKebabCase = `
.test-class {
  background: white;
}`;

            const mockFileName = 'index.module.css';
            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

            const { contents } = await runOnLoadHook(
              onLoadHook,
              { mockFileName, mockFileContent: mockFileContentKebabCase }
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = '4e6b6b5fb2aba1e71d4f619563aa5dd3196dc39177fec2591ba5985b7fce1c2a';
const css = \`
._test-class_jogu8_2 {
  background: white;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
module.exports = { 'test-class': '_test-class_jogu8_2' }
module['css'] = css;
module['digest'] = digest;"
`);
          });

          it('should map PascalCase class names to PascalCase export', async () => {
            expect.assertions(1);
            const mockFileContentPascalCase = `
.TestClass {
  background: white;
}`;

            const mockFileName = 'index.module.css';
            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

            const { contents } = await runOnLoadHook(
              onLoadHook,
              { mockFileName, mockFileContent: mockFileContentPascalCase }
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = '86d0ab75f61f32582cec3b0195d0ecfbde103f660afbc7426663ada518f1f0a5';
const css = \`
._TestClass_ndabk_2 {
  background: white;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
module.exports = { 'TestClass': '_TestClass_ndabk_2' }
module['css'] = css;
module['digest'] = digest;"
`);
          });

          it('should map a combination of class names to the correct export', async () => {
            expect.assertions(1);
            const mockFileContent = `
.testClass {
  background: white;
}
.test-class {
  font-color: black;
}
.TestClass {
  font-size: 16px;
}`;

            const mockFileName = 'index.module.css';
            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;

            const { contents } = await runOnLoadHook(
              onLoadHook,
              { mockFileName, mockFileContent }
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = 'ed48420423f1f7e20e2928760486f1e4601840fc4eede99b965397aa5f739bb8';
const css = \`
._testClass_1mj1y_2 {
  background: white;
}
._test-class_1mj1y_5 {
  font-color: black;
}
._TestClass_1mj1y_8 {
  font-size: 16px;
}\`;
(function() {
  if ( global.BROWSER && !document.getElementById(digest)) {
    var el = document.createElement('style');
    el.id = digest;
    el.textContent = css;
    document.head.appendChild(el);
  }
})();
module.exports = { 'testClass': '_testClass_1mj1y_2', 'test-class': '_test-class_1mj1y_5', 'TestClass': '_TestClass_1mj1y_8' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });
        });

        describe('purgecss', () => {
          glob.sync.mockReturnValue(['Test.jsx']);
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

            export default Component;`,
          };
          const mockFileNameAndContent = {
            mockFileName: 'index.module.css',
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
          };

          it('should not purge css by default', async () => {
            expect.assertions(1);

            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;
            const { contents } = await runOnLoadHook(
              onLoadHook,
              mockFileNameAndContent,
              additionalMockedFiles
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = 'bec209059b0fca9bfe3221e70ce9deb5b73196ef71f2b1171ed73f09d53edbc8';
const css = \`            ._root_18xtd_1 {
              background: white;
            }

            ._somethingElse_18xtd_5 {
              font-color: lime;
            }

            ._second_18xtd_9 {
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
module.exports = { 'root': '_root_18xtd_1', 'somethingElse': '_somethingElse_18xtd_5', 'second': '_second_18xtd_9' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should purge css if disabled === false', async () => {
            expect.assertions(1);

            getModulesBundlerConfig.mockImplementationOnce(() => ({
              enabled: true,
            }));

            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;
            const { contents } = await runOnLoadHook(
              onLoadHook,
              mockFileNameAndContent,
              additionalMockedFiles
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = 'a4b4b7b1b3332cc2e20331d5b11a79c021125e809ed8187e65eeca7756852397';
const css = \`            ._root_18xtd_1 {
              background: white;
            }

            ._second_18xtd_9 {
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
module.exports = { 'root': '_root_18xtd_1', 'second': '_second_18xtd_9' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });

          it('should purge css if enabled === true', async () => {
            expect.assertions(1);

            getModulesBundlerConfig.mockImplementationOnce(() => ({
              disabled: false,
            }));

            const plugin = stylesLoader({}, {
              bundleType: BUNDLE_TYPES.BROWSER,
            });
            const onLoadHook = runSetupAndGetLifeHooks(plugin).onLoad[0].hookFunction;
            const { contents } = await runOnLoadHook(
              onLoadHook,
              mockFileNameAndContent,
              additionalMockedFiles
            );

            expect(contents).toMatchInlineSnapshot(`
"const digest = 'a4b4b7b1b3332cc2e20331d5b11a79c021125e809ed8187e65eeca7756852397';
const css = \`            ._root_18xtd_1 {
              background: white;
            }

            ._second_18xtd_9 {
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
module.exports = { 'root': '_root_18xtd_1', 'second': '_second_18xtd_9' }
module['css'] = css;
module['digest'] = digest;"
`
            );
          });
        });
      });

      describe('PRODUCTION environment', () => {
        mockNodeEnv('production');

        it('should transform inputs to default outputs for purged css, browser', async () => {
          glob.sync.mockReturnValue(['Test.jsx']);

          getModulesBundlerConfig.mockImplementationOnce(() => ({
            enabled: true,
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
              mockFileName: 'index.module.css',
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
module.exports = { 'root': '_root_1vf0l_1', 'second': '_second_1vf0l_9' }
module['css'] = css;
module['digest'] = digest;"
`
          );
        });

        it('should transform inputs to named outputs for purged css, browser', async () => {
          glob.sync.mockReturnValue(['Test.jsx']);

          getModulesBundlerConfig.mockImplementationOnce(() => ({
            enabled: true,
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
              mockFileName: 'index.module.css',
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
module.exports = { 'root': '_root_1vf0l_1', 'second': '_second_1vf0l_9' }
module['css'] = css;
module['digest'] = digest;"
`
          );
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
module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
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
module.exports = {  }
module['css'] = css;
module['digest'] = digest;"
`);
        });
      });
    });
  });
});
