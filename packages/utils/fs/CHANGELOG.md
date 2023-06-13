# Changelog

## [0.1.8](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.7...@arroyodev-llc/utils.fs-v0.1.8) (2023-06-13)


### Features

* **deps:** Set pnpm to 8.6.2 ([6f170ec](https://github.com/ArroyoDev-LLC/components/commit/6f170ec6974d005723bd593bf86fb269b9b34fb8))


### Bug Fixes

* **projen.component.nx-monorepo:** Remove all subproject `pnpm` fields ([31cd278](https://github.com/ArroyoDev-LLC/components/commit/31cd278b8e3969f7a80a1ab29dd43683a56f0425))
* **projen.project.typescript:** Update `addWorkspaceDeps`, default props to runtime ([33a3cae](https://github.com/ArroyoDev-LLC/components/commit/33a3caea11ba09eb9b70eb7c684edeed12783581))

## [0.1.7](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.6...@arroyodev-llc/utils.fs-v0.1.7) (2023-06-12)


### Features

* **deps:** Update dependencies ([b01d60b](https://github.com/ArroyoDev-LLC/components/commit/b01d60bbc0bbe8e70b3fa28e3064d5bddf885dc3))
* **deps:** Update vue-tsc ([8f4579a](https://github.com/ArroyoDev-LLC/components/commit/8f4579a17c29e9479a2e4702a4020ac032802a31))
* **projen.components.unbuild:** `package.json` package export ([ffe0a48](https://github.com/ArroyoDev-LLC/components/commit/ffe0a483f32585d1cb552c7c5d26f1a121e5c30d))

## [0.1.6](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.5...@arroyodev-llc/utils.fs-v0.1.6) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))

## [0.1.5](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.4...@arroyodev-llc/utils.fs-v0.1.5) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))

## [0.1.4](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.3...@arroyodev-llc/utils.fs-v0.1.4) (2023-05-29)


### Features

* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))

## [0.1.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/utils.fs-v0.1.2...@arroyodev-llc/utils.fs-v0.1.3) (2023-05-28)


### Features

* **projen.component.vitest:** Add `test:watch` command ([bc6b813](https://github.com/ArroyoDev-LLC/components/commit/bc6b8138d23ea50cb8e9d30f80f9fc311d179c22))


### Tests

* **config:** Update all vitest configs ([1adf407](https://github.com/ArroyoDev-LLC/components/commit/1adf407d8975ccbc1b132342065b3665d63679e2))

## 0.1.2 (2023-05-27)


### Features

* **fs.utils:** Export cache module from utils.fs ([00332a2](https://github.com/ArroyoDev-LLC/components/commit/00332a296c8c23931aeecb9b1ab30f98f2e29ff3))
* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))
* **utils.fs:** `checksumGenerator` and related utilities. ([f0b1637](https://github.com/ArroyoDev-LLC/components/commit/f0b1637dc130d73778c4c06dd48740235d08f035))
* **utils.fs:** Add pathe as dependency ([af41835](https://github.com/ArroyoDev-LLC/components/commit/af41835901482c019f486667b7a5c530a0541bef))
* **utils.fs:** Conditionally strip commas and semicolons in `stripFormatting` ([a3e57b2](https://github.com/ArroyoDev-LLC/components/commit/a3e57b2b551122799355be4a805bde963d3468c3))
* **utils.fs:** Implement `simpleNodeModulesCacheStore` and related interfaces. ([dea7f2a](https://github.com/ArroyoDev-LLC/components/commit/dea7f2ab63b7a05aa473c9554e41a267b126cc4b))
* **utils.fs:** Scaffold utils.fs managed files ([f40ce8d](https://github.com/ArroyoDev-LLC/components/commit/f40ce8d4fcfecaf04628e225e1dc6d27d91edf71))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))
* **utils.fs:** Default undefined, fix store name path in cache store ([207c891](https://github.com/ArroyoDev-LLC/components/commit/207c8912d5dee4b71bbaefbdb2c2b68fcfda59fc))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))


### Tests

* **ui.fs:** Unit test suite for checksum module ([87ca70b](https://github.com/ArroyoDev-LLC/components/commit/87ca70bf979d7eadc9a45c071e2f59a05df4a1b4))
* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))
* **utils.fs:** Add and update unit tests ([d5d778c](https://github.com/ArroyoDev-LLC/components/commit/d5d778c83cfaa25c8067496074f4b0889e2d75fa))
* **utils.fs:** Test suite for `simpleNodeModulesCacheStore` ([8024393](https://github.com/ArroyoDev-LLC/components/commit/8024393bb564583ef47d1bf419d47c8ff849daf5))
