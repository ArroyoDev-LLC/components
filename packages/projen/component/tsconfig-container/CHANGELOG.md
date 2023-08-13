# Changelog

## [0.1.13](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.12...@arroyodev-llc/projen.component.tsconfig-container-v0.1.13) (2023-08-13)


### Features

* **projen.component.ts-container:** Add inline `overrides` property to `defineConfig` method ([c51beb4](https://github.com/ArroyoDev-LLC/components/commit/c51beb40725b5756168a0fcfaa4ebaad8a2e7d95))
* **projen.component.ts-container:** Implement support for tsconfig project references ([333ca03](https://github.com/ArroyoDev-LLC/components/commit/333ca031f585f64c07465c37fc99bfe2fde4eed1))
* **projenrc:** Update all manage tsconfigs/unbuild/package exports ([0808084](https://github.com/ArroyoDev-LLC/components/commit/0808084c6cebd9d7ead2b01fd021efaf470088bc))
* **projenrc:** Update dependencies ([296048f](https://github.com/ArroyoDev-LLC/components/commit/296048f5d578df7c81e1927ed2c7c84898c2153b))


### Bug Fixes

* **projen.component.ts-container:** Reduce logging verbosity ([68b8488](https://github.com/ArroyoDev-LLC/components/commit/68b8488ec519d48d06d41aeebc34f4c4eb15f335))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.18

## [0.1.12](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.11...@arroyodev-llc/projen.component.tsconfig-container-v0.1.12) (2023-07-19)


### Features

* **projen.component.tsc-container:** Add static `ensure` and `nearest` methods ([7f8dc6f](https://github.com/ArroyoDev-LLC/components/commit/7f8dc6f9980d0d8cddb3491e57c2e7baf07a446f))
* **projen.component.tsc-container:** Add utils.projen as dependency ([286bcc0](https://github.com/ArroyoDev-LLC/components/commit/286bcc0a706a1e8dfef11046b7e9eafa6a0d2157))
* **projen.component.tsc-container:** Implement config building with merge strategies ([3d01b01](https://github.com/ArroyoDev-LLC/components/commit/3d01b0191efe15465dde4fa6c9211a7bfcdffc66))
* **projen.component.tsconfig-container:** Support tsconfig project paths mapping ([6f7948e](https://github.com/ArroyoDev-LLC/components/commit/6f7948e29996d714b67c4dd32ef61de558fab2d5))
* **projenrc:** Update managed files and dependencies ([7e24f20](https://github.com/ArroyoDev-LLC/components/commit/7e24f20b0551bdd8972a3a6aac3622e88e3eb19e))


### Bug Fixes

* **projen.component.tsconfig-container:** Use `nearest` in `ensure` ([e609ab7](https://github.com/ArroyoDev-LLC/components/commit/e609ab7df7e8f0b2bc0cca409f60d87f78e97523))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.17

## [0.1.11](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.10...@arroyodev-llc/projen.component.tsconfig-container-v0.1.11) (2023-07-07)


### Features

* **deps:** Update dependencies and generated files ([bf84839](https://github.com/ArroyoDev-LLC/components/commit/bf84839a3b8ee79342001ccd16936cf13b307bdc))

## [0.1.10](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.9...@arroyodev-llc/projen.component.tsconfig-container-v0.1.10) (2023-06-13)


### Features

* **deps:** Set pnpm to 8.6.2 ([6f170ec](https://github.com/ArroyoDev-LLC/components/commit/6f170ec6974d005723bd593bf86fb269b9b34fb8))


### Bug Fixes

* **projen.component.nx-monorepo:** Remove all subproject `pnpm` fields ([31cd278](https://github.com/ArroyoDev-LLC/components/commit/31cd278b8e3969f7a80a1ab29dd43683a56f0425))
* **projen.project.typescript:** Update `addWorkspaceDeps`, default props to runtime ([33a3cae](https://github.com/ArroyoDev-LLC/components/commit/33a3caea11ba09eb9b70eb7c684edeed12783581))

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.8...@arroyodev-llc/projen.component.tsconfig-container-v0.1.9) (2023-06-12)


### Features

* **deps:** Update dependencies ([b01d60b](https://github.com/ArroyoDev-LLC/components/commit/b01d60bbc0bbe8e70b3fa28e3064d5bddf885dc3))
* **deps:** Update vue-tsc ([8f4579a](https://github.com/ArroyoDev-LLC/components/commit/8f4579a17c29e9479a2e4702a4020ac032802a31))
* **projen.components.unbuild:** `package.json` package export ([ffe0a48](https://github.com/ArroyoDev-LLC/components/commit/ffe0a483f32585d1cb552c7c5d26f1a121e5c30d))

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.7...@arroyodev-llc/projen.component.tsconfig-container-v0.1.8) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.6...@arroyodev-llc/projen.component.tsconfig-container-v0.1.7) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.5...@arroyodev-llc/projen.component.tsconfig-container-v0.1.6) (2023-05-29)


### Features

* **deps:** Update all dependencies ([fc8d06f](https://github.com/ArroyoDev-LLC/components/commit/fc8d06ffc3347b10a118ebab6c7f02a6b9587568))
* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.4...@arroyodev-llc/projen.component.tsconfig-container-v0.1.5) (2023-05-27)


### Features

* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))


### Tests

* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))

## [0.1.4](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.3...@arroyodev-llc/projen.component.tsconfig-container-v0.1.4) (2023-05-26)


### Features

* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))
* Update all deps ([52fda07](https://github.com/ArroyoDev-LLC/components/commit/52fda07b7be66ec81ffff301d111b52bc46fc068))


### Bug Fixes

* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.component.tsconfig-container-v0.1.2...@arroyodev-llc/projen.component.tsconfig-container-v0.1.3) (2023-05-24)


### Features

* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))

## 0.1.2 (2023-05-20)


### Features

* **projen.component.tsconfig-container:** Implement `TypescriptConfigContainer` component ([b2cc3d1](https://github.com/ArroyoDev-LLC/components/commit/b2cc3d16399d411edcb3c0243572bad31ea1b824))
* **projen.component.tsconfig-container:** Scaffold tsconfig-container managed files. ([9ae2e96](https://github.com/ArroyoDev-LLC/components/commit/9ae2e960271407956638048429920456dfbed590))
* **projen:** Synth all tsconfigs. ([1fcb9d7](https://github.com/ArroyoDev-LLC/components/commit/1fcb9d7e7c4840ff7d463453cff44201b03e996a))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))
