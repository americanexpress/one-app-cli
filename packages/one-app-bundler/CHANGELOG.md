# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 6.12.0 (2021-01-27)


### Bug Fixes

* **bundler:** add trailing slash to externals resolver ([a106d16](https://github.com/americanexpress/one-app-cli/commit/a106d16ff84bb65a76c171edea1d1c543eb3b964))
* **errors:** fix loaders not throwing correctly ([#179](https://github.com/americanexpress/one-app-cli/issues/179)) ([4f1e1d7](https://github.com/americanexpress/one-app-cli/commit/4f1e1d7be93363fdc1ab51cf0ae03fbafae2462d))
* **eslint:** correct issues ([b816220](https://github.com/americanexpress/one-app-cli/commit/b8162200abe70b5002d8c93ca67b9eca376a639f))
* **lodash:** bring in security fix for prototype pollution ([9e063c3](https://github.com/americanexpress/one-app-cli/commit/9e063c313ced8f0ca0533b7b2e47d2c3b211a9d5))
* **readPkgUp:** fix use packageJson from readPkgUp.sync instead of pkg ([f36c328](https://github.com/americanexpress/one-app-cli/commit/f36c32810d06ddd8920ad82f26fec6b98a458978))


### Features

* **one-app-locale-bundler:** friendly json parse errors ([#137](https://github.com/americanexpress/one-app-cli/issues/137)) ([a05ca27](https://github.com/americanexpress/one-app-cli/commit/a05ca27698b1a2d8a38d2ea5e086961d046dd96e))



# 6.10.0 (2020-08-28)


### Bug Fixes

* **fetch:** cross-fetch and abort-controller polyfills ([#135](https://github.com/americanexpress/one-app-cli/issues/135)) ([af3300b](https://github.com/americanexpress/one-app-cli/commit/af3300bb783070b1daa4870e5534cc73e9b599c8))


### Features

* **sass:** allow the use of sass files ([#131](https://github.com/americanexpress/one-app-cli/issues/131)) ([f8e7cfe](https://github.com/americanexpress/one-app-cli/commit/f8e7cfe6d25a83ae914c93f5c54f42066491f2cd))



# 6.9.0 (2020-08-13)


### Bug Fixes

* **generator:** react-intl in externals ([#83](https://github.com/americanexpress/one-app-cli/issues/83)) ([ee5a759](https://github.com/americanexpress/one-app-cli/commit/ee5a759058516f5da34c3969b67ec8d18a86807e))
* **webpackCallback:** exit code was 0 despite errors ([#128](https://github.com/americanexpress/one-app-cli/issues/128)) ([211a659](https://github.com/americanexpress/one-app-cli/commit/211a659c234e124ec77b0c53c9b6bb2202acdf55))


### Features

* **bundler:** allow the use of external library CSS ([#124](https://github.com/americanexpress/one-app-cli/issues/124)) ([764c44d](https://github.com/americanexpress/one-app-cli/commit/764c44d1c705ba36b19407bbf1d26cf1863f99d6))
* **validation:** validate bundler config ([#119](https://github.com/americanexpress/one-app-cli/issues/119)) ([3e8d7ba](https://github.com/americanexpress/one-app-cli/commit/3e8d7ba0db2a35f2b30f414b2f33b95eaea2e8e1))



# 6.8.0 (2020-07-21)


### Bug Fixes

* **css-loader:** add import loaders count ([6efe354](https://github.com/americanexpress/one-app-cli/commit/6efe354591c0852031f78aa49f1edb3177c462a8))



# 6.7.0 (2020-06-18)


### Bug Fixes

* **bundler:** fix an issue with requiredExternals ([#81](https://github.com/americanexpress/one-app-cli/issues/81)) ([481ba1c](https://github.com/americanexpress/one-app-cli/commit/481ba1c4dbdc244ba09037bf82f7803cb58df30d))
* **bundler/assets:** fallback to file loader ([62c86ef](https://github.com/americanexpress/one-app-cli/commit/62c86efd4ad079a73d6b0e07a5462d7a030b2ac3))
* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **one-app-bundler:** maxEntrypointSize and increase default to 250e3 ([#77](https://github.com/americanexpress/one-app-cli/issues/77)) ([6f86a24](https://github.com/americanexpress/one-app-cli/commit/6f86a2409cc11f33b8c3a573ecb798a57837f3f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **url-loader:** add missing dep of url-loader ([5f4a70b](https://github.com/americanexpress/one-app-cli/commit/5f4a70b5a6b6ddaf1f39ba9eae7110d236a808b3))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **babel-loader:** cache transpilation ([#69](https://github.com/americanexpress/one-app-cli/issues/69)) ([64e0599](https://github.com/americanexpress/one-app-cli/commit/64e05996bb7f95d6d20bcc1edb66a95f855db8ee))
* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)



## 6.1.1 (2020-01-24)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))



# 6.0.0 (2019-12-19)


### Features

* **all:** initial oss release ([696609c](https://github.com/americanexpress/one-app-cli/commit/696609c702b128ba0339064173ac328ce8c00766))





# 6.11.0 (2020-11-04)


### Bug Fixes

* **bundler:** add trailing slash to externals resolver ([a106d16](https://github.com/americanexpress/one-app-cli/commit/a106d16ff84bb65a76c171edea1d1c543eb3b964))
* **lodash:** bring in security fix for prototype pollution ([9e063c3](https://github.com/americanexpress/one-app-cli/commit/9e063c313ced8f0ca0533b7b2e47d2c3b211a9d5))
* **readPkgUp:** fix use packageJson from readPkgUp.sync instead of pkg ([f36c328](https://github.com/americanexpress/one-app-cli/commit/f36c32810d06ddd8920ad82f26fec6b98a458978))


### Features

* **one-app-locale-bundler:** friendly json parse errors ([#137](https://github.com/americanexpress/one-app-cli/issues/137)) ([a05ca27](https://github.com/americanexpress/one-app-cli/commit/a05ca27698b1a2d8a38d2ea5e086961d046dd96e))



# 6.10.0 (2020-08-27)


### Bug Fixes

* **fetch:** cross-fetch and abort-controller polyfills ([#135](https://github.com/americanexpress/one-app-cli/issues/135)) ([af3300b](https://github.com/americanexpress/one-app-cli/commit/af3300bb783070b1daa4870e5534cc73e9b599c8))


### Features

* **sass:** allow the use of sass files ([#131](https://github.com/americanexpress/one-app-cli/issues/131)) ([f8e7cfe](https://github.com/americanexpress/one-app-cli/commit/f8e7cfe6d25a83ae914c93f5c54f42066491f2cd))



# 6.9.0 (2020-08-13)


### Bug Fixes

* **generator:** react-intl in externals ([#83](https://github.com/americanexpress/one-app-cli/issues/83)) ([ee5a759](https://github.com/americanexpress/one-app-cli/commit/ee5a759058516f5da34c3969b67ec8d18a86807e))
* **webpackCallback:** exit code was 0 despite errors ([#128](https://github.com/americanexpress/one-app-cli/issues/128)) ([211a659](https://github.com/americanexpress/one-app-cli/commit/211a659c234e124ec77b0c53c9b6bb2202acdf55))


### Features

* **bundler:** allow the use of external library CSS ([#124](https://github.com/americanexpress/one-app-cli/issues/124)) ([764c44d](https://github.com/americanexpress/one-app-cli/commit/764c44d1c705ba36b19407bbf1d26cf1863f99d6))
* **validation:** validate bundler config ([#119](https://github.com/americanexpress/one-app-cli/issues/119)) ([3e8d7ba](https://github.com/americanexpress/one-app-cli/commit/3e8d7ba0db2a35f2b30f414b2f33b95eaea2e8e1))



# 6.8.0 (2020-07-21)


### Bug Fixes

* **css-loader:** add import loaders count ([6efe354](https://github.com/americanexpress/one-app-cli/commit/6efe354591c0852031f78aa49f1edb3177c462a8))



# 6.7.0 (2020-06-18)


### Bug Fixes

* **bundler:** fix an issue with requiredExternals ([#81](https://github.com/americanexpress/one-app-cli/issues/81)) ([481ba1c](https://github.com/americanexpress/one-app-cli/commit/481ba1c4dbdc244ba09037bf82f7803cb58df30d))
* **bundler/assets:** fallback to file loader ([62c86ef](https://github.com/americanexpress/one-app-cli/commit/62c86efd4ad079a73d6b0e07a5462d7a030b2ac3))
* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **one-app-bundler:** maxEntrypointSize and increase default to 250e3 ([#77](https://github.com/americanexpress/one-app-cli/issues/77)) ([6f86a24](https://github.com/americanexpress/one-app-cli/commit/6f86a2409cc11f33b8c3a573ecb798a57837f3f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **url-loader:** add missing dep of url-loader ([5f4a70b](https://github.com/americanexpress/one-app-cli/commit/5f4a70b5a6b6ddaf1f39ba9eae7110d236a808b3))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **babel-loader:** cache transpilation ([#69](https://github.com/americanexpress/one-app-cli/issues/69)) ([64e0599](https://github.com/americanexpress/one-app-cli/commit/64e05996bb7f95d6d20bcc1edb66a95f855db8ee))
* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)



## 6.1.1 (2020-01-24)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))



# 6.0.0 (2019-12-19)


### Features

* **all:** initial oss release ([696609c](https://github.com/americanexpress/one-app-cli/commit/696609c702b128ba0339064173ac328ce8c00766))





# 6.9.0 (2020-08-12)


### Bug Fixes

* **generator:** react-intl in externals ([#83](https://github.com/americanexpress/one-app-cli/issues/83)) ([ee5a759](https://github.com/americanexpress/one-app-cli/commit/ee5a759058516f5da34c3969b67ec8d18a86807e))
* **webpackCallback:** exit code was 0 despite errors ([#128](https://github.com/americanexpress/one-app-cli/issues/128)) ([211a659](https://github.com/americanexpress/one-app-cli/commit/211a659c234e124ec77b0c53c9b6bb2202acdf55))


### Features

* **bundler:** allow the use of external library CSS ([#124](https://github.com/americanexpress/one-app-cli/issues/124)) ([764c44d](https://github.com/americanexpress/one-app-cli/commit/764c44d1c705ba36b19407bbf1d26cf1863f99d6))
* **validation:** validate bundler config ([#119](https://github.com/americanexpress/one-app-cli/issues/119)) ([3e8d7ba](https://github.com/americanexpress/one-app-cli/commit/3e8d7ba0db2a35f2b30f414b2f33b95eaea2e8e1))



# 6.8.0 (2020-07-21)


### Bug Fixes

* **css-loader:** add import loaders count ([6efe354](https://github.com/americanexpress/one-app-cli/commit/6efe354591c0852031f78aa49f1edb3177c462a8))



# 6.7.0 (2020-06-18)


### Bug Fixes

* **bundler:** fix an issue with requiredExternals ([#81](https://github.com/americanexpress/one-app-cli/issues/81)) ([481ba1c](https://github.com/americanexpress/one-app-cli/commit/481ba1c4dbdc244ba09037bf82f7803cb58df30d))
* **bundler/assets:** fallback to file loader ([62c86ef](https://github.com/americanexpress/one-app-cli/commit/62c86efd4ad079a73d6b0e07a5462d7a030b2ac3))
* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **one-app-bundler:** maxEntrypointSize and increase default to 250e3 ([#77](https://github.com/americanexpress/one-app-cli/issues/77)) ([6f86a24](https://github.com/americanexpress/one-app-cli/commit/6f86a2409cc11f33b8c3a573ecb798a57837f3f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **url-loader:** add missing dep of url-loader ([5f4a70b](https://github.com/americanexpress/one-app-cli/commit/5f4a70b5a6b6ddaf1f39ba9eae7110d236a808b3))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **babel-loader:** cache transpilation ([#69](https://github.com/americanexpress/one-app-cli/issues/69)) ([64e0599](https://github.com/americanexpress/one-app-cli/commit/64e05996bb7f95d6d20bcc1edb66a95f855db8ee))
* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)



## 6.1.1 (2020-01-24)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))



# 6.0.0 (2019-12-19)


### Features

* **all:** initial oss release ([696609c](https://github.com/americanexpress/one-app-cli/commit/696609c702b128ba0339064173ac328ce8c00766))





# 6.8.0 (2020-07-20)


### Bug Fixes

* **css-loader:** add import loaders count ([6efe354](https://github.com/americanexpress/one-app-cli/commit/6efe354591c0852031f78aa49f1edb3177c462a8))



# 6.7.0 (2020-06-18)


### Bug Fixes

* **bundler:** fix an issue with requiredExternals ([#81](https://github.com/americanexpress/one-app-cli/issues/81)) ([481ba1c](https://github.com/americanexpress/one-app-cli/commit/481ba1c4dbdc244ba09037bf82f7803cb58df30d))
* **bundler/assets:** fallback to file loader ([62c86ef](https://github.com/americanexpress/one-app-cli/commit/62c86efd4ad079a73d6b0e07a5462d7a030b2ac3))
* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
* **one-app-bundler:** maxEntrypointSize and increase default to 250e3 ([#77](https://github.com/americanexpress/one-app-cli/issues/77)) ([6f86a24](https://github.com/americanexpress/one-app-cli/commit/6f86a2409cc11f33b8c3a573ecb798a57837f3f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **url-loader:** add missing dep of url-loader ([5f4a70b](https://github.com/americanexpress/one-app-cli/commit/5f4a70b5a6b6ddaf1f39ba9eae7110d236a808b3))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **babel-loader:** cache transpilation ([#69](https://github.com/americanexpress/one-app-cli/issues/69)) ([64e0599](https://github.com/americanexpress/one-app-cli/commit/64e05996bb7f95d6d20bcc1edb66a95f855db8ee))
* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))
* **purgecss:** additional options for purgecss ([#61](https://github.com/americanexpress/one-app-cli/issues/61)) ([37f6817](https://github.com/americanexpress/one-app-cli/commit/37f6817565d65b4027260d409208c4ab3abe3b50))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)



## 6.1.1 (2020-01-24)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))



# 6.0.0 (2019-12-19)


### Features

* **all:** initial oss release ([696609c](https://github.com/americanexpress/one-app-cli/commit/696609c702b128ba0339064173ac328ce8c00766))
