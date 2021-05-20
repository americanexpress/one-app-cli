
# [6.12.0](https://github.com/americanexpress/one-app-cli/compare/v6.11.0...v6.12.0) (2021-02-23)


### Bug Fixes

* **commitlint:** validate commit message on ci ([e9a57af](https://github.com/americanexpress/one-app-cli/commit/e9a57af098f26982aa1569ccce0056687348a6ca))
* **errors:** fix loaders not throwing correctly ([#179](https://github.com/americanexpress/one-app-cli/issues/179)) ([4f1e1d7](https://github.com/americanexpress/one-app-cli/commit/4f1e1d7be93363fdc1ab51cf0ae03fbafae2462d))
* **externals:** add getTenantRootModule validation ([7f3d47a](https://github.com/americanexpress/one-app-cli/commit/7f3d47ad68c2bf1b02445406f10acb5d0d17a4aa))


### Features

* **bundler:** add global.BROWSER false for server bundle ([4435991](https://github.com/americanexpress/one-app-cli/commit/443599149d2b8724ca37c577ddbb6321f6bbb7f6))
* **oneAppRunner:** mount NODE_EXTRA_CA_CERTS cert ([#225](https://github.com/americanexpress/one-app-cli/issues/225)) ([fdf1f42](https://github.com/americanexpress/one-app-cli/commit/fdf1f424286bf5698e7df0e3d80a530dca6b958d))


### Reverts

* Revert "chore(eslint-plugin): switch to plugin instead of rule (#193)" (#219) ([2ed771b](https://github.com/americanexpress/one-app-cli/commit/2ed771be647829ab60e05f36b0a0c68cc9baa91a)), closes [#193](https://github.com/americanexpress/one-app-cli/issues/193) [#219](https://github.com/americanexpress/one-app-cli/issues/219)



# [6.11.0](https://github.com/americanexpress/one-app-cli/compare/v6.10.0...v6.11.0) (2020-11-05)


### Bug Fixes

* **bundler:** add trailing slash to externals resolver ([a106d16](https://github.com/americanexpress/one-app-cli/commit/a106d16ff84bb65a76c171edea1d1c543eb3b964))
* **lodash:** bring in security fix for prototype pollution ([9e063c3](https://github.com/americanexpress/one-app-cli/commit/9e063c313ced8f0ca0533b7b2e47d2c3b211a9d5))
* **readPkgUp:** fix use packageJson from readPkgUp.sync instead of pkg ([f36c328](https://github.com/americanexpress/one-app-cli/commit/f36c32810d06ddd8920ad82f26fec6b98a458978))


### Features

* **deps:** update generated module deps ([#153](https://github.com/americanexpress/one-app-cli/issues/153)) ([865bf24](https://github.com/americanexpress/one-app-cli/commit/865bf245de329dc6f4d08e79b75a90bea8c92996))
* **one-app-locale-bundler:** friendly json parse errors ([#137](https://github.com/americanexpress/one-app-cli/issues/137)) ([a05ca27](https://github.com/americanexpress/one-app-cli/commit/a05ca27698b1a2d8a38d2ea5e086961d046dd96e))
* **one-app-runner:** add container name flag ([#76](https://github.com/americanexpress/one-app-cli/issues/76)) ([fbd0fb5](https://github.com/americanexpress/one-app-cli/commit/fbd0fb55ef7f7998cef9ebab5b99e78132f401a5))
* **runner:** add offline flag ([#158](https://github.com/americanexpress/one-app-cli/issues/158)) ([fb05b7d](https://github.com/americanexpress/one-app-cli/commit/fb05b7de67a4de0088466423e3d73dc45195cc93))



# [6.10.0](https://github.com/americanexpress/one-app-cli/compare/v6.9.0...v6.10.0) (2020-08-28)


### Bug Fixes

* **fetch:** cross-fetch and abort-controller polyfills ([#135](https://github.com/americanexpress/one-app-cli/issues/135)) ([af3300b](https://github.com/americanexpress/one-app-cli/commit/af3300bb783070b1daa4870e5534cc73e9b599c8))


### Features

* **sass:** allow the use of sass files ([#131](https://github.com/americanexpress/one-app-cli/issues/131)) ([f8e7cfe](https://github.com/americanexpress/one-app-cli/commit/f8e7cfe6d25a83ae914c93f5c54f42066491f2cd))



# [6.9.0](https://github.com/americanexpress/one-app-cli/compare/v6.8.0...v6.9.0) (2020-08-13)


### Bug Fixes

* **generator:** react-intl in externals ([#83](https://github.com/americanexpress/one-app-cli/issues/83)) ([ee5a759](https://github.com/americanexpress/one-app-cli/commit/ee5a759058516f5da34c3969b67ec8d18a86807e))
* **webpackCallback:** exit code was 0 despite errors ([#128](https://github.com/americanexpress/one-app-cli/issues/128)) ([211a659](https://github.com/americanexpress/one-app-cli/commit/211a659c234e124ec77b0c53c9b6bb2202acdf55))


### Features

* **bundler:** allow the use of external library CSS ([#124](https://github.com/americanexpress/one-app-cli/issues/124)) ([764c44d](https://github.com/americanexpress/one-app-cli/commit/764c44d1c705ba36b19407bbf1d26cf1863f99d6))
* **generator:** add app compatibility to generator ([5412b1f](https://github.com/americanexpress/one-app-cli/commit/5412b1f82360d38394c9d825227cb7fd68a0e6fd))
* **validation:** validate bundler config ([#119](https://github.com/americanexpress/one-app-cli/issues/119)) ([3e8d7ba](https://github.com/americanexpress/one-app-cli/commit/3e8d7ba0db2a35f2b30f414b2f33b95eaea2e8e1))



# [6.8.0](https://github.com/americanexpress/one-app-cli/compare/v6.7.0...v6.8.0) (2020-07-21)


### Bug Fixes

* **css-loader:** add import loaders count ([6efe354](https://github.com/americanexpress/one-app-cli/commit/6efe354591c0852031f78aa49f1edb3177c462a8))


### Features

* **generator:** add one-app-runner script ([#96](https://github.com/americanexpress/one-app-cli/issues/96)) ([e1d0e63](https://github.com/americanexpress/one-app-cli/commit/e1d0e6363a6c66b26094e6c51d9a3ad22e4dab70))
* **generator:** adds .build-cache to gitignore ([d6f3235](https://github.com/americanexpress/one-app-cli/commit/d6f32358328f63b24c1c1fa83e634e72bdda0f6f))


# [6.7.0](https://github.com/americanexpress/one-app-cli/compare/v6.6.0...v6.7.0) (2020-06-18)
# [6.6.0](https://github.com/americanexpress/one-app-cli/compare/v6.5.0...v6.6.0) (2020-05-22)

# [6.5.0](https://github.com/americanexpress/one-app-cli/compare/v6.4.0...v6.5.0) (2020-04-17)
# [6.4.0](https://github.com/americanexpress/one-app-cli/compare/v6.3.0...v6.4.0) (2020-04-06)

# [6.3.0](https://github.com/americanexpress/one-app-cli/compare/v6.2.0...v6.3.0) (2020-03-17)
# [6.2.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.2.0) (2020-02-27)

### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))

## [6.1.1](https://github.com/americanexpress/one-app-cli/compare/v6.1.0...v6.1.1) (2020-01-24)

**Note:** Version bump only for package one-app-cli
**Note:** Version bump only for package @americanexpress/generator-one-app-module
**Note:** Version bump only for package @americanexpress/one-app-bundler

# [6.1.0](https://github.com/americanexpress/one-app-cli/compare/v6.0.0...v6.1.0) (2020-01-24)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **generator:** add generator-one-app-module ([#13](https://github.com/americanexpress/one-app-cli/issues/13)) ([0fd994b](https://github.com/americanexpress/one-app-cli/commit/0fd994b57d2fd9487b31f109f95d13c7e64c14aa))
* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))



# [6.0.0](https://github.com/americanexpress/one-app-cli/compare/823558c397bc128c465b03ab705b9d3de7ae2cad...v6.0.0) (2019-12-19)


### Features

* **all:** initial commit ([823558c](https://github.com/americanexpress/one-app-cli/commit/823558c397bc128c465b03ab705b9d3de7ae2cad))
* **all:** initial oss release ([696609c](https://github.com/americanexpress/one-app-cli/commit/696609c702b128ba0339064173ac328ce8c00766))



