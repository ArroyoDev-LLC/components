# Changelog

## [0.1.11](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.10...@arroyodev-llc/utils.projen-v0.1.11) (2023-05-29)


### Features

* **deps:** Update all dependencies ([fc8d06f](https://github.com/ArroyoDev-LLC/components/commit/fc8d06ffc3347b10a118ebab6c7f02a6b9587568))
* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.4

## [0.1.10](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.9...@arroyodev-llc/utils.projen-v0.1.10) (2023-05-28)


### Features

* **projen.component.vitest:** Add `test:watch` command ([bc6b813](https://github.com/ArroyoDev-LLC/components/commit/bc6b8138d23ea50cb8e9d30f80f9fc311d179c22))
* **utils.projen:** Add `utils.fs`, `reflect-metadata` as dependencies ([75ae351](https://github.com/ArroyoDev-LLC/components/commit/75ae3511a592ded02ed53677a1a6aceacca2cedc))
* **utils.projen:** Setup `reflect-metadata` ([621b1bd](https://github.com/ArroyoDev-LLC/components/commit/621b1bd505c6a92968032e95aaa936dfd29fe6e3))
* **utils.projen:** Utilize `stripFormatting` in `isExpressionEqual` ([83d34a9](https://github.com/ArroyoDev-LLC/components/commit/83d34a9d6ff59abb6e9f03c180d56d80f69b9819))


### Bug Fixes

* **utils.projen:** Continue merge after creating intermediary objects, array merge strategies, array writer function support ([051263f](https://github.com/ArroyoDev-LLC/components/commit/051263fbcf693273015f67e5371ea5184ff5f34d))


### Tests

* **config:** Update all vitest configs ([1adf407](https://github.com/ArroyoDev-LLC/components/commit/1adf407d8975ccbc1b132342065b3665d63679e2))
* **utils.projen:** Add unit tests for intermediary/nested writer functions ([9ed274d](https://github.com/ArroyoDev-LLC/components/commit/9ed274d63a39c9720e59c4af9b73fd7100fbfe38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.3

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.8...@arroyodev-llc/utils.projen-v0.1.9) (2023-05-27)


### Features

* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))


### Tests

* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.7...@arroyodev-llc/utils.projen-v0.1.8) (2023-05-26)


### Features

* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))
* **utils.projen:** `mergeArray/ObjectLiteral` and related deep merge utilities. ([bafa934](https://github.com/ArroyoDev-LLC/components/commit/bafa9341019c04d86a267c5b6c1efe8e86a157f8))
* **utils.projen:** Add `Vitest` to utils projen ([d629f8f](https://github.com/ArroyoDev-LLC/components/commit/d629f8fd5a9ab93d8894a9b7f21ba6cb6e537cb2))


### Bug Fixes

* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))


### Tests

* **projen.component.postcss:** Update snapshots ([8147374](https://github.com/ArroyoDev-LLC/components/commit/814737436fae521d91fa6f475359b2094056891e))
* **utils.projen:** Unit tests for object literal deep merge. ([3b960d3](https://github.com/ArroyoDev-LLC/components/commit/3b960d396a027aaa669855749f41e436220a504a))

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.6...@arroyodev-llc/utils.projen-v0.1.7) (2023-05-24)


### Features

* **projen.component.utils:** Implement `findRootProject` util. ([4fb1b57](https://github.com/ArroyoDev-LLC/components/commit/4fb1b57407a0a9dc444a9cd5eeaf5a7f5f275d4e))
* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.5...@arroyodev-llc/utils.projen-v0.1.6) (2023-05-20)


### Features

* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.4...@arroyodev-llc/utils.projen-v0.1.5) (2023-05-19)


### Bug Fixes

* **projen.component.release-please:** Publish packages from root ([110d400](https://github.com/ArroyoDev-LLC/components/commit/110d4002e681d351f3127aeb04798eb25bb7e1b9))
* **projen:** Update all packaging tasks. ([6ca80e0](https://github.com/ArroyoDev-LLC/components/commit/6ca80e05c2f38b262be0edc718240f6a055b9c0a))

## [0.1.4](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.3...@arroyodev-llc/utils.projen-v0.1.4) (2023-05-19)


### Features

* **utils.projen:** Move `ProjectName` util to utils.projen ([3634b94](https://github.com/ArroyoDev-LLC/components/commit/3634b9433a2a613a315b437a3b9f448951a0c4fb))

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.2...@arroyodev-llc/utils.projen-v0.1.3) (2023-05-16)


### Tests

* **vue.ui.button:** Utilize shallow mount for primevue button ([af65df7](https://github.com/ArroyoDev-LLC/components/commit/af65df7ce7c9ea6d0d12f7ac284a59f7aaf90c40))

## [0.1.2](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.1...@arroyodev-llc/utils.projen-v0.1.2) (2023-05-02)


### Features

* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))
* **utils.projen:** `findComponent` utility. ([e98ddf0](https://github.com/ArroyoDev-LLC/components/commit/e98ddf0fc23db285af797fbf58fa9f782954af58))
* **utils.projen:** `isComponent` utility. ([f7bfdac](https://github.com/ArroyoDev-LLC/components/commit/f7bfdac6148b64074d9bff23685890878e2044c0))
* **utils.projen:** `replaceTask` utility. ([8372540](https://github.com/ArroyoDev-LLC/components/commit/837254063d9577df877a3317063583ff533ac16f))
* **utils.projen:** Define `cwdRelativePath` util ([1d7ffa6](https://github.com/ArroyoDev-LLC/components/commit/1d7ffa6c56f5ff715c5948648a1b52eb5907f8ce))
* **utils.projen:** Move projenrc/utils to component ([551fa53](https://github.com/ArroyoDev-LLC/components/commit/551fa537daa9996218b2b4244418c43e0c514188))


### Bug Fixes

* **projen.utils:** Projen dep ([985903e](https://github.com/ArroyoDev-LLC/components/commit/985903e317c01933f64c7169cb732d69940a1101))
* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))

## [0.1.1](https://github.com/ArroyoDev-LLC/components/compare/utils.projen-v0.1.0...utils.projen-v0.1.1) (2023-05-02)


### Features

* **utils.projen:** `replaceTask` utility. ([8372540](https://github.com/ArroyoDev-LLC/components/commit/837254063d9577df877a3317063583ff533ac16f))

## 0.1.0 (2023-05-01)


### Features

* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))
* **utils.projen:** `findComponent` utility. ([e98ddf0](https://github.com/ArroyoDev-LLC/components/commit/e98ddf0fc23db285af797fbf58fa9f782954af58))
* **utils.projen:** `isComponent` utility. ([f7bfdac](https://github.com/ArroyoDev-LLC/components/commit/f7bfdac6148b64074d9bff23685890878e2044c0))
* **utils.projen:** Define `cwdRelativePath` util ([1d7ffa6](https://github.com/ArroyoDev-LLC/components/commit/1d7ffa6c56f5ff715c5948648a1b52eb5907f8ce))
* **utils.projen:** Move projenrc/utils to component ([551fa53](https://github.com/ArroyoDev-LLC/components/commit/551fa537daa9996218b2b4244418c43e0c514188))


### Bug Fixes

* **projen.utils:** Projen dep ([985903e](https://github.com/ArroyoDev-LLC/components/commit/985903e317c01933f64c7169cb732d69940a1101))
* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
