# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.10
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.11
    * @arroyodev-llc/utils.projen bumped to 0.1.10

## [0.1.14](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.13...@arroyodev-llc/projen.project.nx-monorepo-v0.1.14) (2023-05-27)


### Features

* **projen.component.ts-source:** Disable import/order on generated ts files, update synth check ([d4bcfe6](https://github.com/ArroyoDev-LLC/components/commit/d4bcfe65ed9782b78ef6896f88271325a87682e5))


### Bug Fixes

* **projen.component.linting:** Add `{c,m}.{ts,js}` to eslint import resolvers configs ([3c92f9a](https://github.com/ArroyoDev-LLC/components/commit/3c92f9aa63b40b75356e4c5cde44de9825d7afc0))


### Tests

* Update snaps ([618761e](https://github.com/ArroyoDev-LLC/components/commit/618761e2e9a782305d6a0f096678e35647a71abb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.9
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.10
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.5
    * @arroyodev-llc/utils.projen bumped to 0.1.9

## [0.1.13](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.12...@arroyodev-llc/projen.project.nx-monorepo-v0.1.13) (2023-05-26)


### Bug Fixes

* **projen.project.nx-monorepo:** Add `no-error-on-unmatched-pattern` for root lint ([5c6b2e5](https://github.com/ArroyoDev-LLC/components/commit/5c6b2e55c8d1214a5f1e4f9843c6436487dee2eb))

## [0.1.12](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.11...@arroyodev-llc/projen.project.nx-monorepo-v0.1.12) (2023-05-26)


### Features

* **projen.project.nx-monorepo:** `applyPreSynth` and `immediate` option for `applyRecursive` ([be71b8a](https://github.com/ArroyoDev-LLC/components/commit/be71b8ad5317847a1f22b86644857d3eb1d199ca))
* **projen.project.nx-monorepo:** `TypeDocGithubPages` component ([8299751](https://github.com/ArroyoDev-LLC/components/commit/8299751fd979f9c17880cff209f5fdae680bca94))
* **projen.project.nx-monorepo:** Integrate `tsdoc` monorepo setup. ([3cfc7c4](https://github.com/ArroyoDev-LLC/components/commit/3cfc7c437475f647fdb8ffcb49ce025dc6683d37))
* **projenrc:** Add `docgenOptions` to `nx-monorepo` options. ([8080b40](https://github.com/ArroyoDev-LLC/components/commit/8080b40bf1fe013e6f820a057fdb9e69ce02203a))
* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))
* Update all deps ([52fda07](https://github.com/ArroyoDev-LLC/components/commit/52fda07b7be66ec81ffff301d111b52bc46fc068))


### Bug Fixes

* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))
* **projen.project.nx-monorepo:** Tsdoc github pages workflow build ([3cc72da](https://github.com/ArroyoDev-LLC/components/commit/3cc72da112360e69fb2e7048b8d239134b015817))
* **projen.projen.nx-monorepo:** Invalid workflow reference, update workflows ([0ce69c7](https://github.com/ArroyoDev-LLC/components/commit/0ce69c74a8e85c8de545ef824e5bbba0cc796ae6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.8
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.9
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.4
    * @arroyodev-llc/utils.projen bumped to 0.1.8

## [0.1.11](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.10...@arroyodev-llc/projen.project.nx-monorepo-v0.1.11) (2023-05-25)


### Features

* **projen.component.tailwind:** Update all managed files ([79976df](https://github.com/ArroyoDev-LLC/components/commit/79976df8843afd5248a3f3e24a44258bcf070f3e))


### Bug Fixes

* **projen.component.nx-monorepo:** Lint monorepo root after projects ([4117ed8](https://github.com/ArroyoDev-LLC/components/commit/4117ed898ad5df9060741fe43c9afa6b5f72498b))
* **projen.project.component:** Correct `upgrade-deps` install step to run projen install task ([953cb56](https://github.com/ArroyoDev-LLC/components/commit/953cb56ec18e887f9b796d681dd35d79717d5af0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.8

## [0.1.10](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.9...@arroyodev-llc/projen.project.nx-monorepo-v0.1.10) (2023-05-24)


### Features

* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))


### Bug Fixes

* **projen.project.nx-monorepo:** Fix new type linting errors. ([b7c4de2](https://github.com/ArroyoDev-LLC/components/commit/b7c4de25a31913c7954ab15367dfa480a937591d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.7
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.7
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.3
    * @arroyodev-llc/utils.projen bumped to 0.1.7

## [0.1.9](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.8...@arroyodev-llc/projen.project.nx-monorepo-v0.1.9) (2023-05-23)


### Bug Fixes

* **projen.project.nx-monorepo:** Disable redundant `isolatedModules` w/ `verbatimModuleSyntax` ([d8a9238](https://github.com/ArroyoDev-LLC/components/commit/d8a923809365ac5d3fdbdeceaad06017d1c2aa6e))

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
