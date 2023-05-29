# Changelog

## 0.1.2 (2023-05-29)


### Features

* **deps:** Update lockfile ([f3fae7d](https://github.com/ArroyoDev-LLC/components/commit/f3fae7d259e8a1258ba1ea75acc4d256dfc84384))
* **projen.component.dir-env:** Add `DirEnv` component ([880d0e5](https://github.com/ArroyoDev-LLC/components/commit/880d0e5f4ed06c4d28d1f66720dc1f7454258187))
* **projen.component.dir-env:** Add force direnv version to default envrc template builder ([661cb61](https://github.com/ArroyoDev-LLC/components/commit/661cb619f207f68a76ba272be39ae60efe4060f2))
* **projen.component.dir-env:** Allow options with minDirEnvVersion & localEnvRc on buildDefaultEnvRc ([4c05453](https://github.com/ArroyoDev-LLC/components/commit/4c05453d8212fa80b97e35016fb9afead4684520))
* **projen.component.dir-env:** Allow string on addLayout ([7b33b11](https://github.com/ArroyoDev-LLC/components/commit/7b33b11c8e17957be1c656af4b65dd2f69854b0f))
* **projen.component.dir-env:** Don't write directly to file, add helper functions to `DirEnv` component ([ccdb5c1](https://github.com/ArroyoDev-LLC/components/commit/ccdb5c18598e2d60c0c5f55b0316b4374dfd351c))
* **projen.component.dir-env:** Generate files for dir-env projen component ([050db2b](https://github.com/ArroyoDev-LLC/components/commit/050db2b9a2e2143a87112a86b31b0d2979ca9fd5))
* **projen.component.dir-env:** Improve addCommand with block cb to indent lines ([ffd6aef](https://github.com/ArroyoDev-LLC/components/commit/ffd6aef983caa6b4c444009de1c52de0e0adcc59))
* **projen.component.dir-env:** Make args optional in addCommand, handle args properly ([0f5a7d1](https://github.com/ArroyoDev-LLC/components/commit/0f5a7d1602d1695299948bf20ed41d2951003b65))
* **projen.component.dir-env:** Refactor `DirEnv`, improve methods, use `SourceCode` for better indentation, other fixes from pr review ([618cb3f](https://github.com/ArroyoDev-LLC/components/commit/618cb3f396a041d1f901616e6f24c868e6551c7f))
* **projen.component.dir-env:** Remove preSynthesize ([cc89428](https://github.com/ArroyoDev-LLC/components/commit/cc89428270d5bf6687a703534035ea21918b915b))
* **projen.component.dir-env:** Update addCommand usage in buildDefaultEnvRc ([d3b1308](https://github.com/ArroyoDev-LLC/components/commit/d3b1308764f981aa31c9c4ffd422d3a95a507071))
* **projenrc:** Add `NX_CLOUD_ACCESS_TOKEN` to envrc ([99b2166](https://github.com/ArroyoDev-LLC/components/commit/99b21668612e2c52142763e1153894ed93cdf20d))


### Bug Fixes

* **projen.component.dir-env:** Ensure `has_X` in rtx/asdf conditionals ([580b5c4](https://github.com/ArroyoDev-LLC/components/commit/580b5c47f75955f6ac24e989fa2e3b5bc1fe4570))
* **projen.component.dir-env:** Export enum `DirEnvLogType` ([a57b8fa](https://github.com/ArroyoDev-LLC/components/commit/a57b8fa1c0e7a0d07c8dcdef06b65fea1c5f67ae))
* **projen.component.dir-env:** Fix docker comment to use addComment instead of addCommand ([17ae88d](https://github.com/ArroyoDev-LLC/components/commit/17ae88da7ba8f3d324b48ff27796b2c9db69a090))
* **projen.component.dir-env:** Fix file name validation regex ([5666d40](https://github.com/ArroyoDev-LLC/components/commit/5666d4020faecb43e8a6c21b76257cc0bafab5b1))
* **projen.component.dir-env:** Set defaultValue even if it's set to empty string in addEnvVar ([e4cfc60](https://github.com/ArroyoDev-LLC/components/commit/e4cfc60df8fd249cfb19426d58cf498c88fd15ed))
* **projen.component.dir-env:** Wrap log message from addLog in `"` as it uses addCommand ([b5f0665](https://github.com/ArroyoDev-LLC/components/commit/b5f0665669a3c18d675f575ef6bd936d069159c9))
* **projen.componoent.dir-env:** Fix marker on `DirEnv` ([d682a4b](https://github.com/ArroyoDev-LLC/components/commit/d682a4bfd9c5d7d74c2fb8ca580ff378c77d94fc))


### Miscellaneous Chores

* **release-please:** Set release version. ([91254d3](https://github.com/ArroyoDev-LLC/components/commit/91254d37f198bb0d7366d786fa56a3266dac77d8))
* **release:** Set release ([b231adc](https://github.com/ArroyoDev-LLC/components/commit/b231adc5f371681d5e2b52358be34fa451fd69db))


### Tests

* **projen.component.dir-env:** Add tests + inline snapshots for `DirEnv` component ([32f5d1c](https://github.com/ArroyoDev-LLC/components/commit/32f5d1cfbb6d6744e522bbf8653dd39d4300e3c5))
* **projen.component.dir-env:** Enable `sheBang/marker` unit test, update snaps ([a4d90e4](https://github.com/ArroyoDev-LLC/components/commit/a4d90e4f1b9fa4712e94a75c2cd4982c1f9b895c))
* **projen.component.dir-env:** Fix test snapshots, usages ([203e166](https://github.com/ArroyoDev-LLC/components/commit/203e16654cbe59a966b12e3489ca11c2857a4c5f))
* **projen.component.dir-env:** Update dirEnv test snapshots ([45e1508](https://github.com/ArroyoDev-LLC/components/commit/45e150800f5af8ed11cc0897af76900e2abe1754))
* **projen.component.dir-env:** Update file name validation unit test ([e8e8cd7](https://github.com/ArroyoDev-LLC/components/commit/e8e8cd7acf6def5e79f3736abeb17fcb69454ef8))
