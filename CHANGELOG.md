# This repo has switched to independent versioning

Each package now contains their own CHANGELOG:

* [one-app-bundler](https://github.com/americanexpress/one-app-cli/blob/main/packages/one-app-bundler/CHANGELOG.md)
* [eslint-plugin-one-app](https://github.com/americanexpress/one-app-cli/blob/main/packages/eslint-plugin-one-app/CHANGELOG.md)
* [one-app-dev-bundler](https://github.com/americanexpress/one-app-cli/blob/main/packages/one-app-dev-bundler/CHANGELOG.md)
* [one-app-locale-bundler](https://github.com/americanexpress/one-app-cli/blob/main/packages/one-app-locale-bundler/CHANGELOG.md)
* [one-app-runner](https://github.com/americanexpress/one-app-cli/blob/main/packages/one-app-runner/CHANGELOG.md)
* holocron-dev-server - Deprecated
* generator-one-app-module - Deprecated

# [](https://github.com/americanexpress/one-app-cli/compare/v6.9.0...v) (2020-08-28)


### Bug Fixes

* **fetch:** cross-fetch and abort-controller polyfills ([#135](https://github.com/americanexpress/one-app-cli/issues/135)) ([af3300b](https://github.com/americanexpress/one-app-cli/commit/af3300bb783070b1daa4870e5534cc73e9b599c8))


### Features

* **sass:** allow the use of sass files ([#131](https://github.com/americanexpress/one-app-cli/issues/131)) ([f8e7cfe](https://github.com/americanexpress/one-app-cli/commit/f8e7cfe6d25a83ae914c93f5c54f42066491f2cd))



# [](https://github.com/americanexpress/one-app-cli/compare/v6.9.0...v) (2020-08-28)


### Bug Fixes

* **fetch:** cross-fetch and abort-controller polyfills ([#135](https://github.com/americanexpress/one-app-cli/issues/135)) ([af3300b](https://github.com/americanexpress/one-app-cli/commit/af3300bb783070b1daa4870e5534cc73e9b599c8))


### Features

* **sass:** allow the use of sass files ([#131](https://github.com/americanexpress/one-app-cli/issues/131)) ([f8e7cfe](https://github.com/americanexpress/one-app-cli/commit/f8e7cfe6d25a83ae914c93f5c54f42066491f2cd))



# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.6.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.6.0) (2020-05-22)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **generator:** remove deprecated holocron api ([#65](https://github.com/americanexpress/one-app-cli/issues/65)) ([8d8564a](https://github.com/americanexpress/one-app-cli/commit/8d8564a78bedbd95fd998b3606aa63ad2a4f9049))
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
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))
* **runner:** configuration for browser tests ([#67](https://github.com/americanexpress/one-app-cli/issues/67)) ([4ae5eab](https://github.com/americanexpress/one-app-cli/commit/4ae5eabc4857e96ed39ed8708054f10c151891d6))
* **runner:** require modules if moduleMapUrl is missing ([#48](https://github.com/americanexpress/one-app-cli/issues/48)) ([992af08](https://github.com/americanexpress/one-app-cli/commit/992af08a5dde7d69c6ee3578883c004c5f4d875c))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)





# [6.5.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.5.0) (2020-04-17)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **one-app-runner:** fix runner not reading package.json correctly ([766a99e](https://github.com/americanexpress/one-app-cli/commit/766a99e2191a21983557438135470f67148fa95e))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **generator:** csp report-uri to ONE_CLIENT_CSP_REPORTING_URL ([#50](https://github.com/americanexpress/one-app-cli/issues/50)) ([9ae5dc9](https://github.com/americanexpress/one-app-cli/commit/9ae5dc9fb0d63dc666f7c386fec732e12249435d))
* **generator:** update base-module template ([#25](https://github.com/americanexpress/one-app-cli/issues/25)) ([1a0af74](https://github.com/americanexpress/one-app-cli/commit/1a0af748f94790ceae7b2a87fc827be2d549cf6c))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **one-app-runner:** add ([#34](https://github.com/americanexpress/one-app-cli/issues/34)) ([f3c6755](https://github.com/americanexpress/one-app-cli/commit/f3c67551ec9458f30ddf640666c69f3e673c0784))
* **runner:** require modules if moduleMapUrl is missing ([#48](https://github.com/americanexpress/one-app-cli/issues/48)) ([992af08](https://github.com/americanexpress/one-app-cli/commit/992af08a5dde7d69c6ee3578883c004c5f4d875c))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)





# [6.4.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.4.0) (2020-04-06)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **generator:** update base-module template ([#25](https://github.com/americanexpress/one-app-cli/issues/25)) ([1a0af74](https://github.com/americanexpress/one-app-cli/commit/1a0af748f94790ceae7b2a87fc827be2d549cf6c))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **one-app-runner:** add ([#34](https://github.com/americanexpress/one-app-cli/issues/34)) ([f3c6755](https://github.com/americanexpress/one-app-cli/commit/f3c67551ec9458f30ddf640666c69f3e673c0784))
* **runner:** require modules if moduleMapUrl is missing ([#48](https://github.com/americanexpress/one-app-cli/issues/48)) ([992af08](https://github.com/americanexpress/one-app-cli/commit/992af08a5dde7d69c6ee3578883c004c5f4d875c))





# [6.3.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.3.0) (2020-03-17)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **generator:** update base-module template ([#25](https://github.com/americanexpress/one-app-cli/issues/25)) ([1a0af74](https://github.com/americanexpress/one-app-cli/commit/1a0af748f94790ceae7b2a87fc827be2d549cf6c))
* **one-app-runner:** add ([#34](https://github.com/americanexpress/one-app-cli/issues/34)) ([f3c6755](https://github.com/americanexpress/one-app-cli/commit/f3c67551ec9458f30ddf640666c69f3e673c0784))





# [6.2.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.2.0) (2020-02-27)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))





## [6.1.1](https://github.com/americanexpress/one-app-cli/compare/v6.1.0...v6.1.1) (2020-01-24)

**Note:** Version bump only for package one-app-cli





# [6.1.0](https://github.com/americanexpress/one-app-cli/compare/v6.0.0...v6.1.0) (2020-01-23)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **generator:** add generator-one-app-module ([#13](https://github.com/americanexpress/one-app-cli/issues/13)) ([0fd994b](https://github.com/americanexpress/one-app-cli/commit/0fd994b57d2fd9487b31f109f95d13c7e64c14aa))
* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))
