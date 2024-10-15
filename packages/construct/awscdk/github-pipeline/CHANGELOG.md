# Changelog

## [1.0.3](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.2...@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.3) (2024-10-15)


### Bug Fixes

* **construct.awscdk.github-pipeline:** Ensure unique stage name per account ([40fbd56](https://github.com/ArroyoDev-LLC/components/commit/40fbd5640d0a430780e79527e278c8e4e29217bb))

## [1.0.2](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.1...@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.2) (2024-10-14)


### Bug Fixes

* **construct.awscdk.github-pipeline:** Do not overwrite account-&gt;stage mappings with later stages ([b337a6b](https://github.com/ArroyoDev-LLC/components/commit/b337a6b27d36f7b9a2e81f30044598a80529fc16))

## [1.0.1](https://github.com/ArroyoDev-LLC/components/compare/@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.0...@arroyodev-llc/construct.awscdk.github-pipeline-v1.0.1) (2024-10-08)


### Bug Fixes

* **construct.awscdk.github-pipeline:** Resolve asset files correctly on latest cdk-github-pipelines version ([bc481e9](https://github.com/ArroyoDev-LLC/components/commit/bc481e9e806abdc90d5993d94243201ad33f7ccd))

## 1.0.0 (2024-10-08)


### Features

* **construct.awscdk.github-pipeline:** `CheckoutStep` for checkout action ([b122af4](https://github.com/ArroyoDev-LLC/components/commit/b122af4564afa44d394cde6bc4a160eeb62af4ea))
* **construct.awscdk.github-pipeline:** `concurrency` method for setting workflow concurrency ([7e6551c](https://github.com/ArroyoDev-LLC/components/commit/7e6551c6b61693c801c57ff98815f04f1aceb9ff))
* **construct.awscdk.github-pipeline:** `GithubCodePipeline` builder for github workflow ([73ec63d](https://github.com/ArroyoDev-LLC/components/commit/73ec63d5c08c5cc92c8d80227d7d38df08f05d70))
* **construct.awscdk.github-pipeline:** `interpolateObject` helper for shared key names ([80ce637](https://github.com/ArroyoDev-LLC/components/commit/80ce63706d919a3bc952e34b11ce342936adf559))
* **construct.awscdk.github-pipeline:** `S3BucketStep` for performing s3 actions ([817b42a](https://github.com/ArroyoDev-LLC/components/commit/817b42ab1669e0951aa23bbe386cd61a594f3f59))
* **construct.awscdk.github-pipeline:** Accept additional workflow patchers to GithubWorkflowPipeline ([df05672](https://github.com/ArroyoDev-LLC/components/commit/df05672e71fb7a662ca0fad67cbf6d53a1a52401))
* **construct.awscdk.github-pipeline:** Add decamilize as dependency ([b9beb61](https://github.com/ArroyoDev-LLC/components/commit/b9beb6111c5b11adf266d483e8a3ef46ba9928f6))
* **construct.awscdk.github-pipeline:** Add runner context ([a5ecab7](https://github.com/ArroyoDev-LLC/components/commit/a5ecab72ac549db6a2067e928ffdfc752c5e2ef5))
* **construct.awscdk.github-pipeline:** Add vars to `ActionsContext` enum ([72942ea](https://github.com/ArroyoDev-LLC/components/commit/72942eae86d43f8bcac59a5577c857657c84d5fb))
* **construct.awscdk.github-pipeline:** Builder methods for pre/post publish steps ([dc7880b](https://github.com/ArroyoDev-LLC/components/commit/dc7880b5fc6e75b3fd6ca61dbe1eb43fb7a6cfd2))
* **construct.awscdk.github-pipeline:** Ensure both stage/waves are checked for masking, do not require rootDir/assets prefix ([a9a12d0](https://github.com/ArroyoDev-LLC/components/commit/a9a12d0ebe642d569873df14e525454d58e50e2e))
* **construct.awscdk.github-pipeline:** Extend `JobStep` interface with `workingDirectory`, add public `patch` method ([69873e4](https://github.com/ArroyoDev-LLC/components/commit/69873e4ff04f971341ed09cc114fc6b349f82ab9))
* **construct.awscdk.github-pipeline:** Extract pipeline construct from `stacks.api` ([213aef0](https://github.com/ArroyoDev-LLC/components/commit/213aef06287dcf79a49e9e7526f3c4df3c0c372f))
* **construct.awscdk.github-pipeline:** Implement `environment` prop for synth target ([c755c50](https://github.com/ArroyoDev-LLC/components/commit/c755c5016d9f704bf69e13e4e532f544f78d46bb))
* **construct.awscdk.github-pipeline:** Implement `SynthTarget.commandEnv` ([56a1106](https://github.com/ArroyoDev-LLC/components/commit/56a11069ec306b8f05d5c99ce0e36f8d4646eebe))
* **construct.awscdk.github-pipeline:** Make cdk-pipelines-github a peer dependency ([48e7b52](https://github.com/ArroyoDev-LLC/components/commit/48e7b529bc23dd3dc24824d40eb1f58c3dd72d11))
* **construct.awscdk.github-pipeline:** Precede all jobs with initial mask step always ([55d7274](https://github.com/ArroyoDev-LLC/components/commit/55d7274f7f56b9451523effd17c07fade9c867f9))
* **construct.awscdk.github-pipeline:** Rename to `GithubWorkflowPipeline` ([0515b97](https://github.com/ArroyoDev-LLC/components/commit/0515b97a4bf8d4e5f884000a20eb51f480f3a3da))
* **construct.awscdk.github-pipeline:** Replicate `snakeCaseKeys` for workflow since its private ([30bdb76](https://github.com/ArroyoDev-LLC/components/commit/30bdb7692490f6570683d381a643a1a93849a1b3))
* **construct.awscdk.github-pipeline:** Tool install methods and parameters ([550069d](https://github.com/ArroyoDev-LLC/components/commit/550069de8c3b267256e033967a78ab616640ff36))
* **construct.awscdk.github-pipeline:** Upload assets as a single parallelized job ([b63b5a1](https://github.com/ArroyoDev-LLC/components/commit/b63b5a102fd36bc1e36524c0888669e014a41664))
* **construct.awscdk.github-pipeline:** Use `S3BucketStep` for assets, remove now redundant masks ([ac3ddc8](https://github.com/ArroyoDev-LLC/components/commit/ac3ddc8447f3453eec64ac0105466b3f127a03b1))
* **construct.awscdk.github-pipeline:** Use job matrix for assets publishing ([0001b97](https://github.com/ArroyoDev-LLC/components/commit/0001b974e103fffe74aa91fb075fa643b0cca6a4))
* **construct.awscdk.pipelines:** Add pre and post publish build steps props to `GithubWorkflowPipeline` ([c39131b](https://github.com/ArroyoDev-LLC/components/commit/c39131b6ccb90ef9007f8e9cb93e7038a63084e5))
* **deps:** Update @arroyodev-llc/components dependencies ([a4be950](https://github.com/ArroyoDev-LLC/components/commit/a4be9503b7cad37efdb87b9296279380f3142924))
* **deps:** Update constructs versions ([e5fc1e8](https://github.com/ArroyoDev-LLC/components/commit/e5fc1e895a8f07593ecef692561a270220a491b2))
* **deps:** Update pnpm to 8.7.6 ([4a71e11](https://github.com/ArroyoDev-LLC/components/commit/4a71e110e98ff9cc6d876e2aa3cca5ce721b8a65))
* **deps:** Upgrade components, migrate `[@aws-prototyping-sdk](https://github.com/aws-prototyping-sdk)` -&gt; `[@aws-pdk](https://github.com/aws-pdk)` ([cf265ef](https://github.com/ArroyoDev-LLC/components/commit/cf265ef76626e11aa7c6fc863e4f4b883cc189b6))
* **deps:** Upgrade dependencies ([62818d6](https://github.com/ArroyoDev-LLC/components/commit/62818d65290b050443f719801c1d6dc39139146d))
* **projenrc:** Remove --cache from eslint lint-staged step as to avoid type enriched linting conflict ([7f78ed2](https://github.com/ArroyoDev-LLC/components/commit/7f78ed245838ad641f116108f00727753b2b8d41))
* **projenrc:** Update components dependencies ([937defc](https://github.com/ArroyoDev-LLC/components/commit/937defc8583c0b63bd7ec15c48299c4a02cbc0e7))
* **projen:** Upgrade pnpm to v9.7.1 ([52e3ec3](https://github.com/ArroyoDev-LLC/components/commit/52e3ec3d0761ccdd771f6355c82d184d594102dc))
* Update dependencies ([71f72f0](https://github.com/ArroyoDev-LLC/components/commit/71f72f0f93bc323d2d3398c97360264a4db29a52))


### Bug Fixes

* **construct.awscdk.github-pipeline:** Cancel-in-progress not set when false in workflow concurrecny ([bacd3de](https://github.com/ArroyoDev-LLC/components/commit/bacd3de06b6df5253fdd9ec401f4f81c360d9ce6))
* **construct.awscdk.github-pipeline:** Do not require inputs for workflow call/dispatch ([a8d8460](https://github.com/ArroyoDev-LLC/components/commit/a8d8460685014e4fd6b73c0f7182f47e51a8817e))
* **construct.awscdk.github-pipeline:** Do not specify explicit runner label in runner related checks ([b82bc19](https://github.com/ArroyoDev-LLC/components/commit/b82bc196af50de4711fb17fb0b408f7eb88c3813))
* **construct.awscdk.github-pipeline:** Ensure pipeline mask reference is not lost ([660f765](https://github.com/ArroyoDev-LLC/components/commit/660f76569925aa01ade8351aabf2f2abc8bb9cbe))
* **construct.awscdk.github-pipeline:** Ensure stage names are masked with valid secret name ([0d23662](https://github.com/ArroyoDev-LLC/components/commit/0d2366263d6fc5ab4e254683d859a4b837418a7f))
* **construct.awscdk.github-pipeline:** Handle kebab case stage names ([507ef3f](https://github.com/ArroyoDev-LLC/components/commit/507ef3f6152040202f7206f695571cd436ce9d58))
* **construct.awscdk.github-pipeline:** Only patch checkout steps without explicit parameters ([d0dda57](https://github.com/ArroyoDev-LLC/components/commit/d0dda5731f17c34e5f0fe150ecf85380b48f7634))
* **construct.awscdk.github-pipeline:** Pass correct s3 assets key prefix ([6e6b651](https://github.com/ArroyoDev-LLC/components/commit/6e6b6510707ab4f7593040907dd2e21891445fe8))
* **construct.awscdk.github-pipeline:** Split node/pnpm methods, setup node on during pre-publish if needed ([d986a72](https://github.com/ArroyoDev-LLC/components/commit/d986a726978742b987b188974a2894cbf7ce36d1))
* **construct.awscdk.github-pipeline:** Update default action versions ([530258c](https://github.com/ArroyoDev-LLC/components/commit/530258c65c902ab0528b13fabaf167e692a84890))
* **construct.awscdk.github-pipeline:** Use `cp` for copy action, infer step name ([9f6111e](https://github.com/ArroyoDev-LLC/components/commit/9f6111e60ff114be1e800841900105162df0110b))


### Code Refactoring

* **construct.awscdk.github-pipeline:** Rename github-pipeline -&gt; workflow ([6f47a0a](https://github.com/ArroyoDev-LLC/components/commit/6f47a0a79f7a3117446c4e9e632f293d2a663760))


### Tests

* **construct.awscdk.github-pipeline:** Add basic unit tests ([0519a0d](https://github.com/ArroyoDev-LLC/components/commit/0519a0d5579329374fae8509c40d4624a6eaee12))
* **construct.awscdk.github-pipeline:** Add unit test for gh pipeline with environment synth target ([f008a45](https://github.com/ArroyoDev-LLC/components/commit/f008a45f0319f422d14209e5029320a78c633592))
* **construct.awscdk.github-pipeline:** Add unit test for kebab cased stage names ([0203432](https://github.com/ArroyoDev-LLC/components/commit/02034323f2f72a5a04899ec159994d8eb5a9f491))
* **construct.awscdk.github-pipeline:** Setup vitest ([761a938](https://github.com/ArroyoDev-LLC/components/commit/761a938e83a3e28d6d27aafa60591ce8ea52ab41))
* **construct.awscdk.github-pipeline:** Unit tests for multi-stage, code pipeline, related ([523c6ef](https://github.com/ArroyoDev-LLC/components/commit/523c6efddf3b5f81a92b28a8cde9be976524ce14))
* **construct.awscdk.github-pipeline:** Update snapshots ([2217aca](https://github.com/ArroyoDev-LLC/components/commit/2217aca6bf523206bc49927877b01a8938c7a900))
* **construct.awscdk.github-pipeline:** Update snapshots ([f7c4059](https://github.com/ArroyoDev-LLC/components/commit/f7c40593e0793d2a21597c969ae0e6e9dee0f71f))
* **construct.awscdk.github-pipeline:** Update snapshots ([004ea38](https://github.com/ArroyoDev-LLC/components/commit/004ea3866f23585a40662ad1ac616e9c094a9d03))
* **construct.awscdk.github-pipeline:** Update snapshots ([2d71385](https://github.com/ArroyoDev-LLC/components/commit/2d713854be0e3425a48fd626b49ca1677a010646))
* **construct.awscdk.github-pipeline:** Update snapshots ([09ba69e](https://github.com/ArroyoDev-LLC/components/commit/09ba69e0d2489bdf0e221be674d29b09d431b610))
* **construct.awscdk.github-pipeline:** Update snapshots ([baa7876](https://github.com/ArroyoDev-LLC/components/commit/baa787695beee733256f38fcbd4f7c72bbd64a69))
* **construct.awscdk.github-pipeline:** Update test snapshots ([4cedd09](https://github.com/ArroyoDev-LLC/components/commit/4cedd09ca119c1c809b35215178bec8508793c6c))
* **construct.awscdk.github-pipeline:** Update unit test with commandEnv ([683941f](https://github.com/ArroyoDev-LLC/components/commit/683941ff2eb31ec964b8b13d9ec38c65c044b593))
* **construct.awscdk.github-pipeline:** Update unit tests ([613ed32](https://github.com/ArroyoDev-LLC/components/commit/613ed323835ef6ccf6e7018afd7ba7327da60549))
