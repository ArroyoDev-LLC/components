# Changelog

## 0.1.2 (2023-07-19)


### Features

* **projenrc:** Add type-fest scope, add missing peer deps to vue component project ([bac249d](https://github.com/ArroyoDev-LLC/components/commit/bac249d97a51b8534b76fd0f89f9435e687915bc))
* **projenrc:** Update all utils to use `TypescriptProjectBuilder` ([bda0549](https://github.com/ArroyoDev-LLC/components/commit/bda05495b396470d725e5561a2f4f68e196a69c1))
* **projenrc:** Update managed files and dependencies ([7e24f20](https://github.com/ArroyoDev-LLC/components/commit/7e24f20b0551bdd8972a3a6aac3622e88e3eb19e))
* **utils.projen-builder:** Add type-fest as dep ([fa57f80](https://github.com/ArroyoDev-LLC/components/commit/fa57f807a353b85b7936a12ab97d601d46955d38))
* **utils.projen-builder:** Implement `BaseBuildStep` ([1e5ff5d](https://github.com/ArroyoDev-LLC/components/commit/1e5ff5d18e051c3cb26c439ff4cc27db1cd8580b))
* **utils.projen-builder:** Implement `DefaultOptionsBuilder` ([87f7a6c](https://github.com/ArroyoDev-LLC/components/commit/87f7a6c602e6dd0e3f2d3c4868d2620f8acc8161))
* **utils.projen-builder:** Implement `prepend` option to `ProjectBuilder.add` ([9ffd5b8](https://github.com/ArroyoDev-LLC/components/commit/9ffd5b89fcdf606fa521739f031847009c9b6ade))
* **utils.projen-builder:** Improve and simplify types for projen builder configs ([eae0cea](https://github.com/ArroyoDev-LLC/components/commit/eae0cea116ce670824657718f78e42652a687ce2))
* **utils.projen-builder:** Remove defaults handling from `ProjenBuilder` ([7c2d6dd](https://github.com/ArroyoDev-LLC/components/commit/7c2d6dde4a923710bd983cc3886694ce0f359550))
* **utils.projen-builder:** Scaffold utils.projen-builder ([ac3e515](https://github.com/ArroyoDev-LLC/components/commit/ac3e515390c48c1871e94f53502c55877e4e5dd2))


### Bug Fixes

* **projenrc:** Type-fest dependency issues ([56b738c](https://github.com/ArroyoDev-LLC/components/commit/56b738cf981c962182438ca764c88ac7a1631c24))
* **utils.projen-builder:** Deep merge and waterfall builder options ([d80d2cb](https://github.com/ArroyoDev-LLC/components/commit/d80d2cbf6c3784f850c4be3214726322a72f80a4))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))


### Code Refactoring

* **utils.projen-builder:** Extract `BuildStep` to `build-steps` module ([6760a60](https://github.com/ArroyoDev-LLC/components/commit/6760a60e1a7397b976e66f5d8fd0433c46bdb4ca))
* **utils.projen-builder:** Extract `OptionsPropertyBuilder/`NameSchemeBuilder` to builders ([28432ba](https://github.com/ArroyoDev-LLC/components/commit/28432ba34b2bd8980d02d786ca3dec9d52c65589))
* **utils.projen-builder:** Extract `project-builder` module ([dcae610](https://github.com/ArroyoDev-LLC/components/commit/dcae610b1b2e5a4e3158518fb3ce31f9ba394819))
* **utils.projen-builder:** Extract types module ([27bc96b](https://github.com/ArroyoDev-LLC/components/commit/27bc96ba6186db53520ab6224aa6d9908f9f6ecd))
* **utils.projen-builder:** Move logic from `utils.projen` ([3af3985](https://github.com/ArroyoDev-LLC/components/commit/3af398553bfc9fec1967012cbf30d4be2493801b))


### Documentation

* **utils.projen-builder:** Annotate classes/methods/interfaces/types ([75ca0c9](https://github.com/ArroyoDev-LLC/components/commit/75ca0c9ae6511b6906854490999aad298d34d4fc))


### Tests

* **utils.projen-builder:** Add prepend, related unit tests ([0fc0169](https://github.com/ArroyoDev-LLC/components/commit/0fc0169cba293159c70e69379ebe7fbdb0050086))
* **utils.projen-builder:** Add unit tests ([dfdf9f9](https://github.com/ArroyoDev-LLC/components/commit/dfdf9f9a667d06707da506f8a4d02bd2b280dfe1))
* **utils.projen-builder:** Update tests, add `DefaultOptionsBuilder` test ([55321dd](https://github.com/ArroyoDev-LLC/components/commit/55321dd89d21b0c3b3b2b716020973adbc766398))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @arroyodev-llc/utils.projen bumped to 0.1.17