# Changelog

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.7...@arroyodev-llc/projen.project.nx-monorepo-v0.1.8) (2023-05-23)


### Features

* **projen.project.nx-monorepo:** Export defaults, deep merge options. ([f35b30e](https://github.com/ArroyoDev-LLC/components/commit/f35b30ea20f214c7a03dcd17ec9af25052483672))


### Bug Fixes

* **projen.component.vue:** Remove duplicative unbuild step ([b481e17](https://github.com/ArroyoDev-LLC/components/commit/b481e172898cf1f986b0777af0c6bf0c854facf9))

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.6...@arroyodev-llc/projen.project.nx-monorepo-v0.1.7) (2023-05-20)


### Features

* **projen.project.nx-monorepo:** Move organization common defaults to nx-monorepo project. ([f92e1a6](https://github.com/ArroyoDev-LLC/components/commit/f92e1a69c1a784d5da196ad30cd27f944563e95d))
* **projen.project.nx-monorepo:** Override tsconfig/dev configs to use extends ([8b7a446](https://github.com/ArroyoDev-LLC/components/commit/8b7a44620c753261bababb485cb36beffd46448b))

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.5...@arroyodev-llc/projen.project.nx-monorepo-v0.1.6) (2023-05-20)


### Features

* **projen.project.nx-monorepo:** Utilize `TypescriptConfigContainer` in nx monorepo. ([38eef03](https://github.com/ArroyoDev-LLC/components/commit/38eef037e7bc2054c43af656941ec7b482eb80b4))
* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.6
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.6
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.2
    * @arroyodev-llc/utils.projen bumped to 0.1.6

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.4...@arroyodev-llc/projen.project.nx-monorepo-v0.1.5) (2023-05-20)


### Bug Fixes

* **projen.project.nx-monorepo:** Fix upgrade-deps pnpm install invalid step ([7170039](https://github.com/ArroyoDev-LLC/components/commit/7170039024734e56a23fd53ecf45935c719f94af))
* **projenrc:** Set `defaultReleaseBranch` to optional instead of omitting ([ee3dc30](https://github.com/ArroyoDev-LLC/components/commit/ee3dc309ca826cb2e3a382a63b9aaebd9ff9aca3))


### Code Refactoring

* **projen.project.nx-monorepo:** Cleanup default options, remove nx token, default task other ([7d1b180](https://github.com/ArroyoDev-LLC/components/commit/7d1b180bc4ca8fdb8884f0dad17e1e0ad40deee4))

## [0.1.4](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.3...@arroyodev-llc/projen.project.nx-monorepo-v0.1.4) (2023-05-20)


### Bug Fixes

* **projen.project.nx-monorepo:** Properly handle missing github component. ([f6d4621](https://github.com/ArroyoDev-LLC/components/commit/f6d46211ac6f0d1c27b429ddf2991f7fd70db13f))
* **projen.project.nx-monorepo:** Set npm auth token env global in build workflow ([1636ee6](https://github.com/ArroyoDev-LLC/components/commit/1636ee6c726ae314535b5d2667f2a203c901253b))

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.2...@arroyodev-llc/projen.project.nx-monorepo-v0.1.3) (2023-05-19)


### Bug Fixes

* **projen.component.release-please:** Publish packages from root ([110d400](https://github.com/ArroyoDev-LLC/components/commit/110d4002e681d351f3127aeb04798eb25bb7e1b9))
* **projen:** Update all packaging tasks. ([6ca80e0](https://github.com/ArroyoDev-LLC/components/commit/6ca80e05c2f38b262be0edc718240f6a055b9c0a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.5
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.5
    * @arroyodev-llc/utils.projen bumped to 0.1.5

## 0.1.2 (2023-05-19)


### Features

* **projen.project.nx-monorepo:** Move and refactor nx-monorepo to subproject ([aeeac36](https://github.com/ArroyoDev-LLC/components/commit/aeeac36de839673458f71907fa065c0f74b3d64e))
* **projen.project.nx-monorepo:** Scaffold managed files. ([b9d3cda](https://github.com/ArroyoDev-LLC/components/commit/b9d3cda5bca83c9067677ced1c670c5607b147cc))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.4
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.4
    * @arroyodev-llc/utils.projen bumped to 0.1.4
