# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.4

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.10

## [0.1.13](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.12...@arroyodev-llc/projen.component.linting-v0.1.13) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.13

## [0.1.12](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.11...@arroyodev-llc/projen.component.linting-v0.1.12) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.12

## [0.1.11](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.10...@arroyodev-llc/projen.component.linting-v0.1.11) (2023-05-29)


### Features

* **deps:** Update all dependencies ([fc8d06f](https://github.com/ArroyoDev-LLC/components/commit/fc8d06ffc3347b10a118ebab6c7f02a6b9587568))
* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.11

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.8...@arroyodev-llc/projen.component.linting-v0.1.9) (2023-05-27)


### Features

* **projen.component.linting:** Add `p-queue` dependency ([2fbf37d](https://github.com/ArroyoDev-LLC/components/commit/2fbf37dd842a22230565a7c25526ddc00c42288a))
* **projen.component.linting:** Apply resolvable extensions once during pre-synth ([fa70e67](https://github.com/ArroyoDev-LLC/components/commit/fa70e67f7ffa47b75cc0a4386e3015b788ee92f9))
* **projen.component.linting:** Implement linting queue to limit concurrency of generating file linting ([9eb3848](https://github.com/ArroyoDev-LLC/components/commit/9eb38486af6ede2ad316201a9ed718838dfccdc9))
* **projen.component.linting:** Implement public `addResolvableExtensions` method ([d4ab9c6](https://github.com/ArroyoDev-LLC/components/commit/d4ab9c6b9a79325f6fa9b65a7044b1072e46525f))
* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))


### Tests

* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.9

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.7...@arroyodev-llc/projen.component.linting-v0.1.8) (2023-05-26)


### Features

* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))


### Bug Fixes

* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.8

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.6...@arroyodev-llc/projen.component.linting-v0.1.7) (2023-05-24)


### Features

* **projen.component.linting:** Implement formatting of files post-synth in parallel ([2311b39](https://github.com/ArroyoDev-LLC/components/commit/2311b39e27aaed276922e96c04076542a94985fe))
* **projen.component.linting:** Implement support for eslint type-enriched linting ([c174b2e](https://github.com/ArroyoDev-LLC/components/commit/c174b2ea43d2dd777b336409984d6f3a375a95e0))
* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.7

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.5...@arroyodev-llc/projen.component.linting-v0.1.6) (2023-05-20)


### Features

* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.6

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.4...@arroyodev-llc/projen.component.linting-v0.1.5) (2023-05-19)


### Bug Fixes

* **projen.component.release-please:** Publish packages from root ([110d400](https://github.com/ArroyoDev-LLC/components/commit/110d4002e681d351f3127aeb04798eb25bb7e1b9))
* **projen:** Update all packaging tasks. ([6ca80e0](https://github.com/ArroyoDev-LLC/components/commit/6ca80e05c2f38b262be0edc718240f6a055b9c0a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.5

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.2...@arroyodev-llc/projen.component.linting-v0.1.3) (2023-05-16)


### Tests

* **vue.ui.button:** Utilize shallow mount for primevue button ([af65df7](https://github.com/ArroyoDev-LLC/components/commit/af65df7ce7c9ea6d0d12f7ac284a59f7aaf90c40))

## [0.1.2](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.linting-v0.1.1...@arroyodev-llc/projen.component.linting-v0.1.2) (2023-05-02)


### Features

* **projen.component.linting:** Migrate `LintConfig` to component ([adabcca](https://github.com/ArroyoDev-LLC/components/commit/adabccadcb458769cb0084b755a6adc3f639f675))
* **projen.components.linting:** Define `updateEslintTask`, `setEslintExec` public methods. ([ada151e](https://github.com/ArroyoDev-LLC/components/commit/ada151e930e3080e7274c971950f81b3495b0bd0))
* **projen:** Define projen.component.linting component ([aa1aeab](https://github.com/ArroyoDev-LLC/components/commit/aa1aeab866f4916cf79c257fcefcc8d13139c063))
* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))


### Bug Fixes

* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))

## [0.1.1](https://github.com/ArroyoDev-LLC/components/compare/projen.component.linting-v0.1.0...projen.component.linting-v0.1.1) (2023-05-02)


### Features

* **projen.components.linting:** Define `updateEslintTask`, `setEslintExec` public methods. ([ada151e](https://github.com/ArroyoDev-LLC/components/commit/ada151e930e3080e7274c971950f81b3495b0bd0))

## 0.1.0 (2023-05-01)


### Features

* **projen.component.linting:** Migrate `LintConfig` to component ([adabcca](https://github.com/ArroyoDev-LLC/components/commit/adabccadcb458769cb0084b755a6adc3f639f675))
* **projen:** Define projen.component.linting component ([aa1aeab](https://github.com/ArroyoDev-LLC/components/commit/aa1aeab866f4916cf79c257fcefcc8d13139c063))
* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))


### Bug Fixes

* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
