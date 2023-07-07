# Changelog

## [0.1.16](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.15...@arroyodev-llc/utils.projen-v0.1.16) (2023-07-07)


### Features

* **deps:** Update dependencies and generated files ([bf84839](https://github.com/ArroyoDev-LLC/components/commit/bf84839a3b8ee79342001ccd16936cf13b307bdc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.9

## [0.1.15](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.14...@arroyodev-llc/utils.projen-v0.1.15) (2023-06-13)


### Features

* **deps:** Set pnpm to 8.6.2 ([6f170ec](https://github.com/ArroyoDev-LLC/components/commit/6f170ec6974d005723bd593bf86fb269b9b34fb8))


### Bug Fixes

* **projen.component.nx-monorepo:** Remove all subproject `pnpm` fields ([31cd278](https://github.com/ArroyoDev-LLC/components/commit/31cd278b8e3969f7a80a1ab29dd43683a56f0425))
* **projen.component.pnpm-workspace:** Revert dropped workspace protocol ([3e73083](https://github.com/ArroyoDev-LLC/components/commit/3e73083bd971367a1046156386977b3897191063))
* **projen.project.typescript:** Update `addWorkspaceDeps`, default props to runtime ([33a3cae](https://github.com/ArroyoDev-LLC/components/commit/33a3caea11ba09eb9b70eb7c684edeed12783581))
* **projenrc:** Set all root workspace deps as dev ([e98ba9d](https://github.com/ArroyoDev-LLC/components/commit/e98ba9d7824b66130f8f542332d9148fe0e60ce3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.8

## [0.1.14](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.13...@arroyodev-llc/utils.projen-v0.1.14) (2023-06-12)


### Features

* **deps:** Update dependencies ([b01d60b](https://github.com/ArroyoDev-LLC/components/commit/b01d60bbc0bbe8e70b3fa28e3064d5bddf885dc3))
* **deps:** Update vue-tsc ([8f4579a](https://github.com/ArroyoDev-LLC/components/commit/8f4579a17c29e9479a2e4702a4020ac032802a31))
* **projen.components.unbuild:** `package.json` package export ([ffe0a48](https://github.com/ArroyoDev-LLC/components/commit/ffe0a483f32585d1cb552c7c5d26f1a121e5c30d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.7

## [0.1.13](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.12...@arroyodev-llc/utils.projen-v0.1.13) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projen.project.typescript:** Check for and use monorepo name scheme, update  `tsconfigBase` ([3e6d731](https://github.com/ArroyoDev-LLC/components/commit/3e6d7313dd6d85fa91db4348ce7ed94abdc0a0b4))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))
* **utils.projen:** Implement `ProjectNameSchemeOptions` into `ProjectName` ([2ecae1a](https://github.com/ArroyoDev-LLC/components/commit/2ecae1a3bdbb0df7b978f3d9fbff32ae97fbf34b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.6

## [0.1.12](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.projen-v0.1.11...@arroyodev-llc/utils.projen-v0.1.12) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))
* **projen.component.ts-ast:** Extract `utils.projen` to `utils.ts-ast` modules ([fdc3844](https://github.com/ArroyoDev-LLC/components/commit/fdc384475ba9be72121c1a511ed7a18bf7255049))
* **projenrc:** Add `utils.ts-ast` deps where needed ([8c03bfb](https://github.com/ArroyoDev-LLC/components/commit/8c03bfbc233ee0b660b619363f4d72e2b6aa22ca))
* **utils.ts-ast:** Scaffold managed files. ([f78a39f](https://github.com/ArroyoDev-LLC/components/commit/f78a39f8c3530af9e914e6dc0413359dde3f2ece))


### Bug Fixes

* **projen.component.tailwind:** Add `utils.ts-ast` dependency ([5c3349a](https://github.com/ArroyoDev-LLC/components/commit/5c3349ac4e7e48d8db8f10b4a33bbcb36fd358f4))
* **utils.projen:** Remove old `reflect-metadata` import ([05dc11b](https://github.com/ArroyoDev-LLC/components/commit/05dc11b8d6c38b0ce9727170bfd1a0c4f9dc64cb))


### Tests

* **utils.projen:** `applyOverrides` unit test ([1de6e3c](https://github.com/ArroyoDev-LLC/components/commit/1de6e3c9516fb010d19fb08845e2900c62119d39))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.fs bumped to 0.1.5

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
