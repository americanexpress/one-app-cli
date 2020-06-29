# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 6.8.0 (2020-06-26)


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





# 6.7.0 (2020-06-17)


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





# [6.6.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.6.0) (2020-05-22)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **externals:** resolver did not recognize complex browser fields ([#66](https://github.com/americanexpress/one-app-cli/issues/66)) ([d35d03c](https://github.com/americanexpress/one-app-cli/commit/d35d03c858a1361a1f214ff3f99b194d2aede521))
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





# [6.5.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.5.0) (2020-04-17)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **deps:** add create-shared-react-context ([#59](https://github.com/americanexpress/one-app-cli/issues/59)) ([16de0a4](https://github.com/americanexpress/one-app-cli/commit/16de0a4619e4a8004f60c952ad7aa6734842a0c1))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))


### Reverts

* Revert "chore(release): bump to v6.5.0 (#62)" ([5f708de](https://github.com/americanexpress/one-app-cli/commit/5f708de11f30163687f3184adb4d57ccab46649c)), closes [#62](https://github.com/americanexpress/one-app-cli/issues/62)





# [6.4.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.4.0) (2020-04-06)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))
* **webpack:** hash collisions between chunks broke dynamic imports ([#30](https://github.com/americanexpress/one-app-cli/issues/30)) ([2cb92d2](https://github.com/americanexpress/one-app-cli/commit/2cb92d231974997dd94671ae9b3170d311558d6f))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))
* **one-app:** removed instances of tenancy or tenant ([#36](https://github.com/americanexpress/one-app-cli/issues/36)) ([9c834f1](https://github.com/americanexpress/one-app-cli/commit/9c834f1cf4378d88101bc09b59a0656938db27b6))
* **one-app-bundler:** use cross-fetch instead of isomorphic-fetch ([#49](https://github.com/americanexpress/one-app-cli/issues/49)) ([e5232cb](https://github.com/americanexpress/one-app-cli/commit/e5232cbc3bfc7fb42f1a2abcc8f17d13015a7f7f))





# [6.3.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.3.0) (2020-03-17)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))
* **one-app-cli:** drop-module command now works ([#35](https://github.com/americanexpress/one-app-cli/issues/35)) ([99a5da1](https://github.com/americanexpress/one-app-cli/commit/99a5da14cffd5692d2130e0b266bcbb5a8d048fc))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))





# [6.2.0](https://github.com/americanexpress/one-app-cli/compare/v6.1.1...v6.2.0) (2020-02-27)


### Bug Fixes

* **css-loader:** upgraded to latest css-loader api as of 3.4.2 ([74cad69](https://github.com/americanexpress/one-app-cli/commit/74cad69fcbe84eeba7a02b009821e6f7a2db62f2))


### Features

* **bundler:** custom client and server webpack configs ([#22](https://github.com/americanexpress/one-app-cli/issues/22)) ([c5a3e82](https://github.com/americanexpress/one-app-cli/commit/c5a3e82d1c4e778cc05b24734390f938d7f984b6))





## [6.1.1](https://github.com/americanexpress/one-app-cli/compare/v6.1.0...v6.1.1) (2020-01-24)

**Note:** Version bump only for package @americanexpress/one-app-bundler





# [6.1.0](https://github.com/americanexpress/one-app-cli/compare/v6.0.0...v6.1.0) (2020-01-23)


### Bug Fixes

* **path:** ensure path to css-base.js is JSON.stringified ([#11](https://github.com/americanexpress/one-app-cli/issues/11)) ([3d4ff6b](https://github.com/americanexpress/one-app-cli/commit/3d4ff6babd3a0f42eb7235140630608e5028c1af)), closes [#10](https://github.com/americanexpress/one-app-cli/issues/10)


### Features

* **lerna:** upgrade lerna to v3.19.0 ([#9](https://github.com/americanexpress/one-app-cli/issues/9)) ([6dacd0b](https://github.com/americanexpress/one-app-cli/commit/6dacd0b8848d1f1045aff36fde2f0d441d0d49a2))
* **one-app-bundler:** add chunk meta to one app build.meta file ([#14](https://github.com/americanexpress/one-app-cli/issues/14)) ([b8a9c3b](https://github.com/americanexpress/one-app-cli/commit/b8a9c3b740a00038d19f15fbbcf354d48a4d238c))
