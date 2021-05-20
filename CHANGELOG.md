# [](https://github.com/americanexpress/one-app-cli/compare/v6.12.0...v) (2021-05-20)


### Bug Fixes

* **deps:** update one-app-ducks to 4.3.1 ([#230](https://github.com/americanexpress/one-app-cli/issues/230)) ([c466a3e](https://github.com/americanexpress/one-app-cli/commit/c466a3ee1e526045570835ec2e1fe97e56bde926))


### Features

* **extendWebpackConfig:** added merge plugin feature ([#248](https://github.com/americanexpress/one-app-cli/issues/248)) ([3cdf5af](https://github.com/americanexpress/one-app-cli/commit/3cdf5af287cb444dfe1519b0a41914db9473ef72))
* **holocron-dev-server:** add holocron dev server ([bf5d231](https://github.com/americanexpress/one-app-cli/commit/bf5d231c2c50c8ca2db4152e13d13eee0c149589))
* **uuuid:** update uuid from 3.x to 8.x ([#220](https://github.com/americanexpress/one-app-cli/issues/220)) ([34ca7d7](https://github.com/americanexpress/one-app-cli/commit/34ca7d7688e7e9655c2eb77576993e472b6823cb))



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



# [6.7.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.7.0) (2020-06-18)


### Bug Fixes

* **bundler:** fix an issue with requiredExternals ([#81](https://github.com/americanexpress/one-app-cli/issues/81)) ([481ba1c](https://github.com/americanexpress/one-app-cli/commit/481ba1c4dbdc244ba09037bf82f7803cb58df30d))
* **bundler/assets:** fallback to file loader ([62c86ef](https://github.com/americanexpress/one-app-cli/commit/62c86efd4ad079a73d6b0e07a5462d7a030b2ac3))
* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **generator:** remove deprecated holocron api ([#65](https://github.com/americanexpress/one-app-cli/issues/65)) ([8d8564a](https://github.com/americanexpress/one-app-cli/commit/8d8564a78bedbd95fd998b3606aa63ad2a4f9049))
* **one-app-bundler:** maxEntrypointSize and increase default to 250e3 ([#77](https://github.com/americanexpress/one-app-cli/issues/77)) ([6f86a24](https://github.com/americanexpress/one-app-cli/commit/6f86a2409cc11f33b8c3a573ecb798a57837f3f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **one-app-runner:** fix runner not reading package.json correctly ([766a99e](https://github.com/americanexpress/one-app-cli/commit/766a99e2191a21983557438135470f67148fa95e))
* **url-loader:** add missing dep of url-loader ([5f4a70b](https://github.com/americanexpress/one-app-cli/commit/5f4a70b5a6b6ddaf1f39ba9eae7110d236a808b3))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **babel-loader:** cache transpilation ([#69](https://github.com/americanexpress/one-app-cli/issues/69)) ([64e0599](https://github.com/americanexpress/one-app-cli/commit/64e05996bb7f95d6d20bcc1edb66a95f855db8ee))
* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **deps:** update generator deps for react-intl and parrot-generator ([ac24226](https://github.com/americanexpress/one-app-cli/commit/ac24226ee1de6ac2f5b02c30050fc8a052c40f35))
* **generator:** csp report-uri to ONE_CLIENT_CSP_REPORTING_URL ([#50](https://github.com/americanexpress/one-app-cli/issues/50)) ([9ae5dc9](https://github.com/americanexpress/one-app-cli/commit/9ae5dc9fb0d63dc666f7c386fec732e12249435d))
* **generator:** update base-module template ([#25](https://github.com/americanexpress/one-app-cli/issues/25)) ([1a0af74](https://github.com/americanexpress/one-app-cli/commit/1a0af748f94790ceae7b2a87fc827be2d549cf6c))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **one-app-runner:** add ([#34](https://github.com/americanexpress/one-app-cli/issues/34)) ([f3c6755](https://github.com/americanexpress/one-app-cli/commit/f3c67551ec9458f30ddf640666c69f3e673c0784))
* **one-app-runner:** create network and env file ([#78](https://github.com/americanexpress/one-app-cli/issues/78)) ([d8ac5ec](https://github.com/americanexpress/one-app-cli/commit/d8ac5ec8a36413217d942e9c5d611c4008b3f346))
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))
* **runner:** configuration for browser tests ([#67](https://github.com/americanexpress/one-app-cli/issues/67)) ([4ae5eab](https://github.com/americanexpress/one-app-cli/commit/4ae5eabc4857e96ed39ed8708054f10c151891d6))
* **runner:** require modules if moduleMapUrl is missing ([#48](https://github.com/americanexpress/one-app-cli/issues/48)) ([992af08](https://github.com/americanexpress/one-app-cli/commit/992af08a5dde7d69c6ee3578883c004c5f4d875c))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)



## [6.1.1](https://github.com/americanexpress/one-app-cli/compare/v6.1.0...v6.1.1) (2020-01-24)



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



