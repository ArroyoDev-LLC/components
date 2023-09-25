# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.7

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.8
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.8
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.11

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.13

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.16

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.20

## [0.1.27](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.26...@arroyodev-llc/projen.project.typescript-v0.1.27) (2023-09-25)


### Features

* **deps:** Upgrade all dependencies ([7d92d7a](https://github.com/ArroyoDev-LLC/components/commit/7d92d7a3219d0c1df79e7c311391deb7f7ed98be))
* Migrate [@aws-prototyping-sdk](https://github.com/aws-prototyping-sdk) -&gt; @aws/pdk ([c701585](https://github.com/ArroyoDev-LLC/components/commit/c701585692de6b4ba01b018805ecedadbab67ca7))
* Update all managed files ([0192cab](https://github.com/ArroyoDev-LLC/components/commit/0192cab235b2bfe7e68a218b2373b919b819085a))


### Bug Fixes

* **projen.project.typescript:** Do not set --cache on eslint task as to not conflict with type-enriched linting ([e1b66e9](https://github.com/ArroyoDev-LLC/components/commit/e1b66e9818b406ca8c34958cd5f0ba93bfb2e415))
* **projenrc:** Remove --cache arg from lint-staged eslint command ([aa18d24](https://github.com/ArroyoDev-LLC/components/commit/aa18d24368ab0c1283bc9dab7dfbaa54a1c69447))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.20
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.21
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.22
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.15
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.23
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.25
    * @arroyodev-llc/utils.projen bumped to 0.1.20
    * @arroyodev-llc/utils.projen-builder bumped to 0.1.5
  * devDependencies
    * @arroyodev-llc/utils.unbuild-composite-preset bumped from ^0.1.2 to ^0.1.3

## [0.1.26](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.25...@arroyodev-llc/projen.project.typescript-v0.1.26) (2023-08-24)


### Features

* **deps:** Update all dependencies ([c095641](https://github.com/ArroyoDev-LLC/components/commit/c095641714560189f59a19f89d1ab06e1815ad6e))
* **deps:** Update pnpm to 8.6.12 ([42ea764](https://github.com/ArroyoDev-LLC/components/commit/42ea7642497786063ff160cf5ce591e56155b4ca))
* **projenrc:** Update all managed unbuild/package files ([923874b](https://github.com/ArroyoDev-LLC/components/commit/923874b536dfa15ae21b81812d70b383551b87c2))


### Bug Fixes

* **projen.project.typescript:** Use `compositePreset` in unbuild by default to preserve incremental builds ([85b19f2](https://github.com/ArroyoDev-LLC/components/commit/85b19f2aacada94630e043b655a6658c0b417da6))
* **projenrc:** Specify useTypeImports on missed projen structs ([fd20489](https://github.com/ArroyoDev-LLC/components/commit/fd204897bb1e6ce4e23b3a970d505aba43e1478a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.19
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.20
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.21
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.14
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.22
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.24
    * @arroyodev-llc/utils.projen bumped to 0.1.19
    * @arroyodev-llc/utils.projen-builder bumped to 0.1.4
  * devDependencies
    * @arroyodev-llc/utils.unbuild-composite-preset bumped from ^0.0.0 to ^0.1.2

## [0.1.25](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.24...@arroyodev-llc/projen.project.typescript-v0.1.25) (2023-08-13)


### Features

* **projen.project.typescript:** Add `composite` tsconfig base to default extends builder ([001b301](https://github.com/ArroyoDev-LLC/components/commit/001b3014a511a82824ed059acb966d0216282697))
* **projen.project.typescript:** Auto-add workspace dependency ([53d4526](https://github.com/ArroyoDev-LLC/components/commit/53d452696979969f744521cfe72e4df8468743ee))
* **projen.project.typescript:** Rollup .dts generated from tsc during ([e38e08a](https://github.com/ArroyoDev-LLC/components/commit/e38e08a46e212a843b9539dda6f538efef59a7a3))
* **projenrc:** Update all manage tsconfigs/unbuild/package exports ([0808084](https://github.com/ArroyoDev-LLC/components/commit/0808084c6cebd9d7ead2b01fd021efaf470088bc))
* **projenrc:** Update dependencies ([296048f](https://github.com/ArroyoDev-LLC/components/commit/296048f5d578df7c81e1927ed2c7c84898c2153b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.18
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.19
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.20
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.13
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.21
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.23
    * @arroyodev-llc/utils.projen bumped to 0.1.18
    * @arroyodev-llc/utils.projen-builder bumped to 0.1.3

## [0.1.23](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.22...@arroyodev-llc/projen.project.typescript-v0.1.23) (2023-07-19)


### Features

* **projen.project.typescript:** `TypescriptBaseBuilder` export ([c27bf1f](https://github.com/ArroyoDev-LLC/components/commit/c27bf1f31550942c35e27185ac1a0cfb196d876f))
* **projen.project.typescript:** `TypescriptBundlerBuilder` impl ([3f9e2ca](https://github.com/ArroyoDev-LLC/components/commit/3f9e2ca283a361533fa2f3aef3e7769616e2e3d1))
* **projen.project.typescript:** `TypescriptConfigBuilder` impl ([7fa46ab](https://github.com/ArroyoDev-LLC/components/commit/7fa46ab79c41980398e388b7ab72618412a9c05b))
* **projen.project.typescript:** `TypescriptESMManifestBuilder` impl ([675296d](https://github.com/ArroyoDev-LLC/components/commit/675296d5d6f7e81b2ead68f702a813c7a780a11d))
* **projen.project.typescript:** `TypescriptLintingBuilder` impl ([8b0ddc2](https://github.com/ArroyoDev-LLC/components/commit/8b0ddc25521e8cfc3fbd79cd624060b46e404e7c))
* **projen.project.typescript:** `TypescriptReleasePleaseBuilder` impl ([38ed109](https://github.com/ArroyoDev-LLC/components/commit/38ed10987f3dc5560a998c43b1e4a3573c93402b))
* **projen.project.typescript:** Add projen.component.tsc-container as dep ([5702922](https://github.com/ArroyoDev-LLC/components/commit/57029224c4cec00c4f000b5f6300c31baf8efdef))
* **projen.project.typescript:** Export builders, add missing type export ([b3da707](https://github.com/ArroyoDev-LLC/components/commit/b3da707dc4db7f019974ed1eef2dd914e767d475))
* **projen.project.typescript:** Mark `TypescriptProject` as `[@deprecated](https://github.com/deprecated)` ([fdf2261](https://github.com/ArroyoDev-LLC/components/commit/fdf2261cb363f3ecfa9baecc76d9389166b70669))
* **projen.project.typescript:** Setup pnpm, initial workspaceDeps in `TypescriptESMManifestBuilder` ([26e0135](https://github.com/ArroyoDev-LLC/components/commit/26e013573289875569dd770fbdd5da55db187c9f))
* **projen.project.typescript:** Utilize projen.component.tsc-container to build typescript configs ([835146f](https://github.com/ArroyoDev-LLC/components/commit/835146fcd0a01e9ef4eb305e1947a0eceb1d7c4b))
* **projenrc:** Add `utils.projen-builder` to monorepo, `projen.project.typescript` ([5b3adf1](https://github.com/ArroyoDev-LLC/components/commit/5b3adf1448bee90e8e466e465c68321d4fdb357a))
* **projenrc:** Add type-fest scope, add missing peer deps to vue component project ([bac249d](https://github.com/ArroyoDev-LLC/components/commit/bac249d97a51b8534b76fd0f89f9435e687915bc))
* **projenrc:** Update managed files and dependencies ([7e24f20](https://github.com/ArroyoDev-LLC/components/commit/7e24f20b0551bdd8972a3a6aac3622e88e3eb19e))


### Bug Fixes

* **projen.project.typescript:** Use ts container to map project tsconfig paths ([c86f956](https://github.com/ArroyoDev-LLC/components/commit/c86f95677d4130c984badaa4f8cec2d397d349b5))
* **projenrc:** Type-fest dependency issues ([56b738c](https://github.com/ArroyoDev-LLC/components/commit/56b738cf981c962182438ca764c88ac7a1631c24))


### Code Refactoring

* **projen.project.typescript:** Extract `builders` module ([b42e647](https://github.com/ArroyoDev-LLC/components/commit/b42e64730c21bb8fa1d34391462bf31c4d5a9bf2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.17
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.18
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.19
    * @arroyodev-llc/projen.component.tsconfig-container bumped to 0.1.12
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.19
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.22
    * @arroyodev-llc/utils.projen bumped to 0.1.17
    * @arroyodev-llc/utils.projen-builder bumped to 0.1.2

## [0.1.22](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.21...@arroyodev-llc/projen.project.typescript-v0.1.22) (2023-07-07)


### Features

* **deps:** Update dependencies and generated files ([bf84839](https://github.com/ArroyoDev-LLC/components/commit/bf84839a3b8ee79342001ccd16936cf13b307bdc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.16
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.17
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.18
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.18
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.21
    * @arroyodev-llc/utils.projen bumped to 0.1.16

## [0.1.21](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.20...@arroyodev-llc/projen.project.typescript-v0.1.21) (2023-06-13)


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
    * @arroyodev-llc/projen.component.linting bumped to 0.1.15
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.16
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.17
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.17
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.20
    * @arroyodev-llc/utils.projen bumped to 0.1.15

## [0.1.19](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.18...@arroyodev-llc/projen.project.typescript-v0.1.19) (2023-06-12)


### Features

* **deps:** Update dependencies ([b01d60b](https://github.com/ArroyoDev-LLC/components/commit/b01d60bbc0bbe8e70b3fa28e3064d5bddf885dc3))
* **deps:** Update vue-tsc ([8f4579a](https://github.com/ArroyoDev-LLC/components/commit/8f4579a17c29e9479a2e4702a4020ac032802a31))
* **projen.components.unbuild:** `package.json` package export ([ffe0a48](https://github.com/ArroyoDev-LLC/components/commit/ffe0a483f32585d1cb552c7c5d26f1a121e5c30d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.14
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.15
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.16
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.15
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.19
    * @arroyodev-llc/utils.projen bumped to 0.1.14

## [0.1.18](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.17...@arroyodev-llc/projen.project.typescript-v0.1.18) (2023-06-01)


### Features

* **deps:** Upgrade dependencies ([0d550b2](https://github.com/ArroyoDev-LLC/components/commit/0d550b219e4fc4691e3b4aab7088a19148cc3deb))
* **projen.component.unbuild:** Hook `stub` task into `post-install` task ([e51c35c](https://github.com/ArroyoDev-LLC/components/commit/e51c35ce69749e33e469970e84fb86d3259c9434))
* **projen.project.nx-monorepo:** Remove `upgrade-deps` workaround ([0543a07](https://github.com/ArroyoDev-LLC/components/commit/0543a07658d8b4023809a1cb2f154ba8923e23f5))
* **projen.project.typescript:** `formatExecCommand` helper ([ff00894](https://github.com/ArroyoDev-LLC/components/commit/ff0089457cfbda481d6d8cf1951b23c7b41373b4))
* **projen.project.typescript:** Check for and use monorepo name scheme, update  `tsconfigBase` ([3e6d731](https://github.com/ArroyoDev-LLC/components/commit/3e6d7313dd6d85fa91db4348ce7ed94abdc0a0b4))
* **projenrc:** Use `LintStaged`, `GitHooks` in `ComponentsMonorepo` ([6f4985c](https://github.com/ArroyoDev-LLC/components/commit/6f4985c01b6ed125698182dc7fccf377f93a33a7))


### Bug Fixes

* **deps:** Set `@aws-prototyping-sdk/nx-monorepo` as peer dependency ([9164411](https://github.com/ArroyoDev-LLC/components/commit/91644119a06691912b591e0d2737f533e541a988))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.13
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.14
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.15
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.14
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.18
    * @arroyodev-llc/utils.projen bumped to 0.1.13

## [0.1.17](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.16...@arroyodev-llc/projen.project.typescript-v0.1.17) (2023-05-29)


### Features

* **build:** Update unbuild config ([eabe562](https://github.com/ArroyoDev-LLC/components/commit/eabe562bea3f7592d1b95f8b8a5d479fa91dd53f))
* **projen.project.typescript:** Enable treeshaking/sourcemap, cjsBridge for unbuild ([c68f340](https://github.com/ArroyoDev-LLC/components/commit/c68f34057f8389993cf5553d9d9cce674cab153d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.12
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.13
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.14
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.13
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.17
    * @arroyodev-llc/utils.projen bumped to 0.1.12

## [0.1.16](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.15...@arroyodev-llc/projen.project.typescript-v0.1.16) (2023-05-29)


### Features

* **deps:** Update all dependencies ([fc8d06f](https://github.com/ArroyoDev-LLC/components/commit/fc8d06ffc3347b10a118ebab6c7f02a6b9587568))
* **package:** Update pnpmVersion related fields ([b352a00](https://github.com/ArroyoDev-LLC/components/commit/b352a00148ca0f7c3f5aa526de55f552b47c814b))
* **projenrc:** Set `pnpmVersion` to v8.6.0 ([eea5f2c](https://github.com/ArroyoDev-LLC/components/commit/eea5f2c3e3e6ac6f4fc72811c9b1751a297a48db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.11
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.12
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.13
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.12
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.16
    * @arroyodev-llc/utils.projen bumped to 0.1.11

## [0.1.15](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.14...@arroyodev-llc/projen.project.typescript-v0.1.15) (2023-05-28)


### Features

* **projenrc:** Add `tsconfig` and related structs, add `types` field ([bfc1b68](https://github.com/ArroyoDev-LLC/components/commit/bfc1b6872f2f08fbbbf204cdb4e3700ec8ddf4f3))
* **projenrc:** Update typescript project ignores ([139f9a5](https://github.com/ArroyoDev-LLC/components/commit/139f9a51ea8cce6e09984c02d7c9a52e512d2a4c))


### Bug Fixes

* **projenrc:** Patch bad `TypeScriptCompilerOptions.emitDeclarationOnly` type ([1758fca](https://github.com/ArroyoDev-LLC/components/commit/1758fcae61856ec309255a675015fdcbdf65e2ed))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.10
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.11
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.12
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.11
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.15
    * @arroyodev-llc/utils.projen bumped to 0.1.10

## [0.1.14](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.13...@arroyodev-llc/projen.project.typescript-v0.1.14) (2023-05-27)


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
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.11
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.10
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.14
    * @arroyodev-llc/utils.projen bumped to 0.1.9

## [0.1.12](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.11...@arroyodev-llc/projen.project.typescript-v0.1.12) (2023-05-26)


### Features

* **projen.project.typescript:** Enable docgen by default ([404be03](https://github.com/ArroyoDev-LLC/components/commit/404be037c29f2a7ce8415536c4c1c7ebdbdc70b6))
* **projenrc:** Update tsdoc related managed files ([f47c7a8](https://github.com/ArroyoDev-LLC/components/commit/f47c7a850310aad5e43769919c3055bb4faec60a))
* Update all deps ([52fda07](https://github.com/ArroyoDev-LLC/components/commit/52fda07b7be66ec81ffff301d111b52bc46fc068))


### Bug Fixes

* **projen.project.nx-monorepo:** Remove absolute path from root lint task ([039d711](https://github.com/ArroyoDev-LLC/components/commit/039d7112eaa5eaa8472b1ab564fa5a48ae92f57a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.8
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.9
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.10
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.9
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.12
    * @arroyodev-llc/utils.projen bumped to 0.1.8

## [0.1.10](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/projen.project.typescript-v0.1.9...@arroyodev-llc/projen.project.typescript-v0.1.10) (2023-05-24)


### Features

* Update all managed linting configurations. ([726f359](https://github.com/ArroyoDev-LLC/components/commit/726f359127b6d45cc24549653d78b3ea129a15e4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/projen.component.linting bumped to 0.1.7
    * @arroyodev-llc/projen.component.pnpm-workspace bumped to 0.1.7
    * @arroyodev-llc/projen.component.release-please bumped to 0.1.9
    * @arroyodev-llc/projen.component.unbuild bumped to 0.1.7
    * @arroyodev-llc/projen.project.nx-monorepo bumped to 0.1.10
    * @arroyodev-llc/utils.projen bumped to 0.1.7

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
