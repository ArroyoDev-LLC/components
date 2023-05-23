# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.7

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.8...@arroyodev-llc/projen.project.typescript-v0.1.9) (2023-05-23)


### Features

* **projen.project.typescript:** Setup unbuild during bundler apply ([7ad4175](https://github.com/ArroyoDev-LLC/components/commit/7ad41753f1bdbee1543c5c477cc14c7e1b6ea8e0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.9

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.7...@arroyodev-llc/projen.project.typescript-v0.1.8) (2023-05-23)


### Features

* **projen.project.typescript:** Add unbuild project option. ([d0e4d81](https://github.com/ArroyoDev-LLC/components/commit/d0e4d81ebc905822c3f6b6d5f5924eac8ce7ee0a))
* **projen.project.typescript:** Deep merge options, check unbuild option ([5a16305](https://github.com/ArroyoDev-LLC/components/commit/5a16305766063d857e2f183e7bbb5262d3fb824f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.8

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.5...@arroyodev-llc/projen.project.typescript-v0.1.6) (2023-05-20)


### Features

* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.6
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.6
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.8
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.6
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.6
    * @arroyodev-llc/utils.projen bumped to 0.1.6

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.4...@arroyodev-llc/projen.project.typescript-v0.1.5) (2023-05-20)


### Bug Fixes

* **projen.project.nx-monorepo:** Fix upgrade-deps pnpm install invalid step ([7170039](https://github.com/ArroyoDev-LLC/components/commit/7170039024734e56a23fd53ecf45935c719f94af))
* **projenrc:** Set `defaultReleaseBranch` to optional instead of omitting ([ee3dc30](https://github.com/ArroyoDev-LLC/components/commit/ee3dc309ca826cb2e3a382a63b9aaebd9ff9aca3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.5

## [0.1.4](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.3...@arroyodev-llc/projen.project.typescript-v0.1.4) (2023-05-20)


### Features

* **projen.project.typescript:** Enable debug log by default. ([538c228](https://github.com/ArroyoDev-LLC/components/commit/538c2288923d03507140df51c9486cedb097bb0b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.7
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.4

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.2...@arroyodev-llc/projen.project.typescript-v0.1.3) (2023-05-19)


### Bug Fixes

* **projen.component.release-please:** Publish packages from root ([110d400](https://github.com/ArroyoDev-LLC/components/commit/110d4002e681d351f3127aeb04798eb25bb7e1b9))
* **projen.project.typescript:** Reset packaging test in typescript projects. ([e659009](https://github.com/ArroyoDev-LLC/components/commit/e6590093dd503cc5c180a4c669a9a4e781749580))
* **projen:** Update all packaging tasks. ([6ca80e0](https://github.com/ArroyoDev-LLC/components/commit/6ca80e05c2f38b262be0edc718240f6a055b9c0a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.5
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.5
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.6
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.5
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.3
    * @arroyodev-llc/utils.projen bumped to 0.1.5

## 0.1.2 (2023-05-19)


### Features

* **projen.project.typescript:** Move options file ([9b163ec](https://github.com/ArroyoDev-LLC/components/commit/9b163ecc39ead08ccfb276f8e6680f3149037322))
* **projen.project.typescript:** Refactor and move typescript project to subpackage. ([355b595](https://github.com/ArroyoDev-LLC/components/commit/355b595b8caed0b45d1c6137fb2564797d373eff))
* **projen.project.typescript:** Scaffold managed project files. ([e3fd578](https://github.com/ArroyoDev-LLC/components/commit/e3fd5789d2ae308a7201d1f491933254c9ca63c1))


### Bug Fixes

* **projen.project.typescript:** Use monorepo as root to fix projen import in options. ([1bf061b](https://github.com/ArroyoDev-LLC/components/commit/1bf061b0a6b34146fd59fc14dcb03dacd91ea26f))
* **projenrc:** Ignore typescript options in ts project. ([b9d39d5](https://github.com/ArroyoDev-LLC/components/commit/b9d39d5a97ce6eb5856702108496ad83447e0610))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.4
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.4
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.5
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.4
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.2
    * @arroyodev-llc/utils.projen bumped to 0.1.4
