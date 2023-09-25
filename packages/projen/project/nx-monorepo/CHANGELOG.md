# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.10
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.11
    * @arroyodev-llc/utils.projen bumped to 0.1.10

## [0.1.25](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.24...@arroyodev-llc/projen.project.nx-monorepo-v0.1.25) (2023-09-25)


### Features

* **deps:** Upgrade all dependencies ([7d92d7a](https://github.com/ArroyoDev-LLC/components/commit/7d92d7a3219d0c1df79e7c311391deb7f7ed98be))
* Migrate [@aws-prototyping-sdk](https://github.com/aws-prototyping-sdk) -&gt; @aws/pdk ([c701585](https://github.com/ArroyoDev-LLC/components/commit/c701585692de6b4ba01b018805ecedadbab67ca7))
* Update all managed files ([0192cab](https://github.com/ArroyoDev-LLC/components/commit/0192cab235b2bfe7e68a218b2373b919b819085a))


### Bug Fixes

* **projenrc:** Remove --cache arg from lint-staged eslint command ([aa18d24](https://github.com/ArroyoDev-LLC/components/commit/aa18d24368ab0c1283bc9dab7dfbaa54a1c69447))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.20
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.21
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.15
    * @arroyodev-llc/utils.projen bumped to 0.1.20
  * devDependencies
    * @arroyodev-llc/utils.unbuild-composite-preset bumped from ^0.1.2 to ^0.1.3

## [0.1.24](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.23...@arroyodev-llc/projen.project.nx-monorepo-v0.1.24) (2023-08-24)


### Features

* **deps:** Update all dependencies ([c095641](https://github.com/ArroyoDev-LLC/components/commit/c095641714560189f59a19f89d1ab06e1815ad6e))
* **deps:** Update pnpm to 8.6.12 ([42ea764](https://github.com/ArroyoDev-LLC/components/commit/42ea7642497786063ff160cf5ce591e56155b4ca))
* **projen.project.nx-monorepo:** Execute dev post-install scripts all in parallel using pnpm ([05d1559](https://github.com/ArroyoDev-LLC/components/commit/05d15597d651cfdf98acf3517b978712a98eae20))
* **projenrc:** Update all managed unbuild/package files ([923874b](https://github.com/ArroyoDev-LLC/components/commit/923874b536dfa15ae21b81812d70b383551b87c2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.19
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.20
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.14
    * @arroyodev-llc/utils.projen bumped to 0.1.19
  * devDependencies
    * @arroyodev-llc/utils.unbuild-composite-preset bumped from ^0.0.0 to ^0.1.2

## [0.1.23](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.22...@arroyodev-llc/projen.project.nx-monorepo-v0.1.23) (2023-08-13)


### Features

* **projen.component.nx-monorepo:** Add all workspace deps as references to monorepo root ([73607dd](https://github.com/ArroyoDev-LLC/components/commit/73607dd1d472b1af72f09ca6a35aafc6516f950c))
* **projen.project.nx-monorepo:** Add and define `composite` base tsconfig ([3925e80](https://github.com/ArroyoDev-LLC/components/commit/3925e802fc658325fc296685b7c9dab6c7cce9c4))
* **projen.project.nx-monorepo:** Execute tsc clean, attempt to remove tsbuildinfo during clean task ([07c304f](https://github.com/ArroyoDev-LLC/components/commit/07c304fdbd294cd65fdf06e5369a56e98ad2b726))
* **projenrc:** Update all manage tsconfigs/unbuild/package exports ([0808084](https://github.com/ArroyoDev-LLC/components/commit/0808084c6cebd9d7ead2b01fd021efaf470088bc))
* **projenrc:** Update dependencies ([296048f](https://github.com/ArroyoDev-LLC/components/commit/296048f5d578df7c81e1927ed2c7c84898c2153b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.18
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.19
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.13
    * @arroyodev-llc/utils.projen bumped to 0.1.18

## [0.1.22](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.21...@arroyodev-llc/projen.project.nx-monorepo-v0.1.22) (2023-07-19)


### Features

* **projen.project.nx-monorepo:** Add local nx runner, use for post-install ([6c6eac8](https://github.com/ArroyoDev-LLC/components/commit/6c6eac800a68f6195ac4dcbc3582263ec764910c))
* **projenrc:** Update managed files and dependencies ([7e24f20](https://github.com/ArroyoDev-LLC/components/commit/7e24f20b0551bdd8972a3a6aac3622e88e3eb19e))


### Bug Fixes

* **projen.project.nx-monorepo:** Do not set link-workspace-packages deep by default ([d7eb0d7](https://github.com/ArroyoDev-LLC/components/commit/d7eb0d72ae8962eaa995e5c81b567388d78ce12c))
* **projen.project.nx-monorepo:** Nx npm scope, use exec for default command ([4b1dfa6](https://github.com/ArroyoDev-LLC/components/commit/4b1dfa610b26d63957fec06e65ab9168215710d7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.17
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.18
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.12
    * @arroyodev-llc/utils.projen bumped to 0.1.17

## [0.1.21](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.20...@arroyodev-llc/projen.project.nx-monorepo-v0.1.21) (2023-07-07)


### Features

* **deps:** Update dependencies and generated files ([bf84839](https://github.com/ArroyoDev-LLC/components/commit/bf84839a3b8ee79342001ccd16936cf13b307bdc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.16
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.17
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.11
    * @arroyodev-llc/utils.projen bumped to 0.1.16

## [0.1.20](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.19...@arroyodev-llc/projen.project.nx-monorepo-v0.1.20) (2023-06-13)


### Features

* **deps:** Set pnpm to 8.6.2 ([6f170ec](https://github.com/ArroyoDev-LLC/components/commit/6f170ec6974d005723bd593bf86fb269b9b34fb8))


### Bug Fixes

* **projen.component.nx-monorepo:** Remove all subproject `pnpm` fields ([31cd278](https://github.com/ArroyoDev-LLC/components/commit/31cd278b8e3969f7a80a1ab29dd43683a56f0425))
* **projen.component.pnpm-workspace:** Revert dropped workspace protocol ([3e73083](https://github.com/ArroyoDev-LLC/components/commit/3e73083bd971367a1046156386977b3897191063))
* **projen.project.nx-monorepo:** Default project opt workspace deps to dev ([9261b88](https://github.com/ArroyoDev-LLC/components/commit/9261b88697d0f9f884a765cb69912990ab5e338d))
* **projen.project.typescript:** Update `addWorkspaceDeps`, default props to runtime ([33a3cae](https://github.com/ArroyoDev-LLC/components/commit/33a3caea11ba09eb9b70eb7c684edeed12783581))
* **projenrc:** Set all root workspace deps as dev ([e98ba9d](https://github.com/ArroyoDev-LLC/components/commit/e98ba9d7824b66130f8f542332d9148fe0e60ce3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.15
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.16
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.10
    * @arroyodev-llc/utils.projen bumped to 0.1.15

## [0.1.19](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.18...@arroyodev-llc/projen.project.nx-monorepo-v0.1.19) (2023-06-12)


### Features

* **deps:** Update dependencies ([b01d60b](https://github.com/ArroyoDev-LLC/components/commit/b01d60bbc0bbe8e70b3fa28e3064d5bddf885dc3))
* **deps:** Update vue-tsc ([8f4579a](https://github.com/ArroyoDev-LLC/components/commit/8f4579a17c29e9479a2e4702a4020ac032802a31))
* **projen.components.unbuild:** `package.json` package export ([ffe0a48](https://github.com/ArroyoDev-LLC/components/commit/ffe0a483f32585d1cb552c7c5d26f1a121e5c30d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.14
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.15
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.9
    * @arroyodev-llc/utils.projen bumped to 0.1.14

## [0.1.18](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.17...@arroyodev-llc/projen.project.nx-monorepo-v0.1.18) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** `nameScheme` default project name scheme getter ([734d8c3](https://github.com/ArroyoDev-LLC/components/commit/734d8c3bc9342a977c33fa6ee041d83d025e57d9))
* **projen.project.nx-monorepo:** Enable `workspaceNodeCache` ([9b2f625](https://github.com/ArroyoDev-LLC/components/commit/9b2f62518b0a5737cd800b3b8d36e84cfcab8cfc))
* **projen.project.nx-monorepo:** Move credentials defaults to `ComponentsMonorepo` ([0c79c2f](https://github.com/ArroyoDev-LLC/components/commit/0c79c2f21466c46faf56ca1b6ba9087237b50b97))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projen.project.nx-monorepo:** Set `link-workspace-packages=deep` by default ([e5c618a](https://github.com/ArroyoDev-LLC/components/commit/e5c618ad82c373c977aec3a6e8df98dc4d0c59a5))
* **projen.project.nx-monorepo:** Setup `post-install` nx task, hook using `postinstall` ([79615b9](https://github.com/ArroyoDev-LLC/components/commit/79615b998f2bc0ce64734598be036174979dd367))
* **projen.project.typescript:** Check for and use monorepo name scheme, update  `tsconfigBase` ([3e6d731](https://github.com/ArroyoDev-LLC/components/commit/3e6d7313dd6d85fa91db4348ce7ed94abdc0a0b4))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))


### Bug Fixes

* **deps:** Set `@aws-prototyping-sdk/nx-monorepo` as peer dependency ([9164411](https://github.com/ArroyoDev-LLC/components/commit/91644119a06691912b591e0d2737f533e541a988))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.13
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.14
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.8
    * @arroyodev-llc/utils.projen bumped to 0.1.13

## [0.1.17](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.16...@arroyodev-llc/projen.project.nx-monorepo-v0.1.17) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.12
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.13
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.7
    * @arroyodev-llc/utils.projen bumped to 0.1.12

## [0.1.16](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.nx-monorepo-v0.1.15...@arroyodev-llc/projen.project.nx-monorepo-v0.1.16) (2023-05-29)


### Features

* **deps:** Update all dependencies ([fc8d06f](https://github.com/ArroyoDev-LLC/components/commit/fc8d06ffc3347b10a118ebab6c7f02a6b9587568))
* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projen.project.nx-monorepo:** Set `packageManager` if `pnpmVersion` provided ([8f29880](https://github.com/ArroyoDev-LLC/components/commit/8f298806c1d300216270f6856c5c5a50dfa392e1))
* **projen.project.nx-monorepo:** Use `packageManager` for setup-pnpm ([b2dcd1d](https://github.com/ArroyoDev-LLC/components/commit/b2dcd1d0a3160f40da84c28caf40b880b96ca08f))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.11
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.12
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.6
    * @arroyodev-llc/utils.projen bumped to 0.1.11

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
