# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.4

## [0.1.10](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.9...@arroyodev-llc/projen.component.typescript-source-file-v0.1.10) (2023-05-27)


### Features

* **projen.component.ts-source:** Add `utils.fs` as dependency ([79110b4](https://github.com/ArroyoDev-LLC/components/commit/79110b4b8b015720116e39d6031be317ce5566f9))
* **projen.component.ts-source:** Add `withCallExpressionConfig` static helper ([7a5077a](https://github.com/ArroyoDev-LLC/components/commit/7a5077a633714d95899fee5c1ed10b4faefa38a8))
* **projen.component.ts-source:** Compare source file on no cache/no synth change ([6f1a8a0](https://github.com/ArroyoDev-LLC/components/commit/6f1a8a0a983999378baeb96178085d0ad0fc6567))
* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))
* **projen.component.ts-source:** Implement `TypeScriptSourceFileCache` component ([52a9d33](https://github.com/ArroyoDev-LLC/components/commit/52a9d33777a7d5f7c3fdf4e6c42ed40322375fa9))
* **projen.component.ts-source:** Skip resynthesis of ts source files unless changed or missing ([bfeaf32](https://github.com/ArroyoDev-LLC/components/commit/bfeaf324112a208313cf551d5b0196e5dc9ac068))
* **vue:** Update vitest configs ([9b5042b](https://github.com/ArroyoDev-LLC/components/commit/9b5042b36033ed67cd32a53b1e2d207ffd0782ca))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))


### Tests

* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.9
    * @arroyodev-llc/utils.fs bumped to 0.1.2
    * @arroyodev-llc/utils.projen bumped to 0.1.9

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.8...@arroyodev-llc/projen.component.typescript-source-file-v0.1.9) (2023-05-26)


### Features

* **projen.component.ts-source:** `configResolver` option support. ([cc1f861](https://github.com/ArroyoDev-LLC/components/commit/cc1f86172f0a34338c8c252a3b12618fbdc8a204))
* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))


### Bug Fixes

* **projen.component.ts-source:** Ensure proper plugin dependency name, allow type override ([6962a9e](https://github.com/ArroyoDev-LLC/components/commit/6962a9e51e2334cc2e6173d70c3f5bddec52a76e))
* **projen.component.ts-source:** Use `dependencyType` in `addPlugin` ([a5551c6](https://github.com/ArroyoDev-LLC/components/commit/a5551c609788b92853dc64bf8b887ed769c1b240))
* **projen.component.ts-source:** Utilize `mergeObjectLiteral` for configs. ([22eb3c2](https://github.com/ArroyoDev-LLC/components/commit/22eb3c258961827ba144a5c8bf37f5b36de9104a))
* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))


### Tests

* **projen.component.postcss:** Update snapshots ([8147374](https://github.com/ArroyoDev-LLC/components/commit/814737436fae521d91fa6f475359b2094056891e))
* **projen.component.vite:** Skip vite config merge for now ([8b2cd61](https://github.com/ArroyoDev-LLC/components/commit/8b2cd615796a0af2ed3eaec838d7c9fcd5922fc6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.8
    * @arroyodev-llc/utils.projen bumped to 0.1.8

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.7...@arroyodev-llc/projen.component.typescript-source-file-v0.1.8) (2023-05-25)


### Features

* **projen.component.tailwind:** Update all managed files ([79976df](https://github.com/ArroyoDev-LLC/components/commit/79976df8843afd5248a3f3e24a44258bcf070f3e))
* **projen.component.ts-source:** `tsconfig` option and parameter. ([bc5564f](https://github.com/ArroyoDev-LLC/components/commit/bc5564f88f090487562c71246d405e4fd53714e3))
* **projen.component.ts-source:** Implement `getDefaultExport` utility method. ([43645c1](https://github.com/ArroyoDev-LLC/components/commit/43645c1e4e6194c8aa9c2440d553d8c045ebd999))
* **projen.component.ts-source:** Implement `getOrCreatePropertyAssignmentInitializer` utility method. ([ca4c4eb](https://github.com/ArroyoDev-LLC/components/commit/ca4c4ebcd1cd6e8a115dd64b5b45965c129d38eb))
* **projen.component.ts-source:** Implement `TypeScriptSourceConfig` component. ([6052418](https://github.com/ArroyoDev-LLC/components/commit/6052418779036aedae2ed4ac27a3a24a8d59f4e3))


### Tests

* **projen.component.tailwind:** Update snapshots ([5b8582c](https://github.com/ArroyoDev-LLC/components/commit/5b8582c9858d8af90327f78f8a2efef680b3c2f5))

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.6...@arroyodev-llc/projen.component.typescript-source-file-v0.1.7) (2023-05-24)


### Features

* **projen.component.typescript-source-file:** Enqueue format of files via lint config ([34f2d71](https://github.com/ArroyoDev-LLC/components/commit/34f2d718ce0c04a3abffd3ad902b5f47240b6591))
* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.7
    * @arroyodev-llc/utils.projen bumped to 0.1.7

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.5...@arroyodev-llc/projen.component.typescript-source-file-v0.1.6) (2023-05-20)


### Features

* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.6

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.4...@arroyodev-llc/projen.component.typescript-source-file-v0.1.5) (2023-05-19)


### Bug Fixes

* **projen.component.release-please:** Publish packages from root ([110d400](https://github.com/ArroyoDev-LLC/components/commit/110d4002e681d351f3127aeb04798eb25bb7e1b9))
* **projen:** Update all packaging tasks. ([6ca80e0](https://github.com/ArroyoDev-LLC/components/commit/6ca80e05c2f38b262be0edc718240f6a055b9c0a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.5

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.2...@arroyodev-llc/projen.component.typescript-source-file-v0.1.3) (2023-05-16)


### Bug Fixes

* **nx-monorepo:** Utilize new `NodePackageUtils` namespace. ([406c31a](https://github.com/ArroyoDev-LLC/components/commit/406c31a0eb77c5de44b36d34453602b388c33227))


### Tests

* **vue.ui.button:** Utilize shallow mount for primevue button ([af65df7](https://github.com/ArroyoDev-LLC/components/commit/af65df7ce7c9ea6d0d12f7ac284a59f7aaf90c40))

## [0.1.2](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.typescript-source-file-v0.1.0...@arroyodev-llc/projen.component.typescript-source-file-v0.1.2) (2023-05-02)


### Features

* **projen.components.ts-source-file:** Move typescript-source-file to projen component. ([79b73ca](https://github.com/ArroyoDev-LLC/components/commit/79b73cacb6010b9a5963131c228fd4c95f45a854))
* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))


### Bug Fixes

* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))

## 0.1.0 (2023-05-01)


### Features

* **projen.components.ts-source-file:** Move typescript-source-file to projen component. ([79b73ca](https://github.com/ArroyoDev-LLC/components/commit/79b73cacb6010b9a5963131c228fd4c95f45a854))
* **projen:** Update managed files. ([964ade5](https://github.com/ArroyoDev-LLC/components/commit/964ade56809db26a69c569eab4d3520cdb30c93f))


### Bug Fixes

* **utils.projen:** Unused type ([9141769](https://github.com/ArroyoDev-LLC/components/commit/91417699cfbdf16c57fcfb2caea522bc4ece785d))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
