// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { github, GitOptions, IgnoreFileOptions, javascript, LoggerOptions, Project, ProjenrcJsonOptions, release, RenovatebotOptions, SampleReadmeProps, typescript } from 'projen';
import type { MonorepoUpgradeDepsOptions, WorkspaceConfig } from '@aws-prototyping-sdk/nx-monorepo';

/**
 * NxMonorepoProjectOptions
 */
export interface NxMonorepoProjectOptions {
  /**
   * TypescriptConfigExtends to use as base.
   */
  readonly tsconfigBase?: javascript.TypescriptConfigExtends;
  /**
   * Dependencies linked by the `workspace` protocol.
   */
  readonly workspaceDeps?: Array<javascript.NodeProject | string>;
  /**
   * Configuration for workspace.
   * @stability stable
   */
  readonly workspaceConfig?: WorkspaceConfig;
  /**
   * Monorepo Upgrade Deps options.
   * This is only used if monorepoUpgradeDeps is true.
   * @default undefined
   * @stability stable
   */
  readonly monorepoUpgradeDepsOptions?: MonorepoUpgradeDepsOptions;
  /**
   * Whether to include an upgrade-deps task at the root of the monorepo which will upgrade all dependencies.
   * @default true
   * @stability stable
   */
  readonly monorepoUpgradeDeps?: boolean;
  /**
   * Disable node warnings from being emitted during build tasks.
   * @default false
   * @stability stable
   */
  readonly disableNodeWarnings?: boolean;
  /**
   * TypeScript version to use.
   * NOTE: Typescript is not semantically versioned and should remain on the
   * same minor, so we recommend using a `~` dependency (e.g. `~1.2.3`).
   * @default "latest"
   * @stability experimental
   */
  readonly typescriptVersion?: string;
  /**
   * The name of the development tsconfig.json file.
   * @default "tsconfig.dev.json"
   * @stability experimental
   */
  readonly tsconfigDevFile?: string;
  /**
   * Custom tsconfig options for the development tsconfig.json file (used for testing).
   * @default - use the production tsconfig options
   * @stability experimental
   */
  readonly tsconfigDev?: javascript.TypescriptConfigOptions;
  /**
   * Custom TSConfig.
   * @default - default options
   * @stability experimental
   */
  readonly tsconfig?: javascript.TypescriptConfigOptions;
  /**
   * Jest tests directory. Tests files should be named `xxx.test.ts`.
   * If this directory is under `srcdir` (e.g. `src/test`, `src/__tests__`),
   * then tests are going to be compiled into `lib/` and executed as javascript.
   * If the test directory is outside of `src`, then we configure jest to
   * compile the code in-memory.
   * @default "test"
   * @stability experimental
   */
  readonly testdir?: string;
  /**
   * Typescript sources directory.
   * @default "src"
   * @stability experimental
   */
  readonly srcdir?: string;
  /**
   * Generate one-time sample in `src/` and `test/` if there are no files there.
   * @default true
   * @stability experimental
   */
  readonly sampleCode?: boolean;
  /**
   * Options for .projenrc.ts.
   * @stability experimental
   */
  readonly projenrcTsOptions?: typescript.ProjenrcOptions;
  /**
   * Use TypeScript for your projenrc file (`.projenrc.ts`).
   * @default false
   * @stability experimental
   * @pjnew true
   */
  readonly projenrcTs?: boolean;
  /**
   * Typescript  artifacts output directory.
   * @default "lib"
   * @stability experimental
   */
  readonly libdir?: string;
  /**
   * Eslint options.
   * @default - opinionated default options
   * @stability experimental
   */
  readonly eslintOptions?: javascript.EslintOptions;
  /**
   * Setup eslint.
   * @default true
   * @stability experimental
   */
  readonly eslint?: boolean;
  /**
   * The .d.ts file that includes the type declarations for this module.
   * @default - .d.ts file derived from the project's entrypoint (usually lib/index.d.ts)
   * @stability experimental
   */
  readonly entrypointTypes?: string;
  /**
   * Docs directory.
   * @default "docs"
   * @stability experimental
   */
  readonly docsDirectory?: string;
  /**
   * Docgen by Typedoc.
   * @default false
   * @stability experimental
   */
  readonly docgen?: boolean;
  /**
   * Do not generate a `tsconfig.dev.json` file.
   * @default false
   * @stability experimental
   */
  readonly disableTsconfigDev?: boolean;
  /**
   * Do not generate a `tsconfig.json` file (used by jsii projects since tsconfig.json is generated by the jsii compiler).
   * @default false
   * @stability experimental
   */
  readonly disableTsconfig?: boolean;
  /**
   * The node version to use in GitHub workflows.
   * @default - same as `minNodeVersion`
   * @stability experimental
   */
  readonly workflowNodeVersion?: string;
  /**
   * The git identity to use in workflows.
   * @default - GitHub Actions
   * @stability experimental
   */
  readonly workflowGitIdentity?: github.GitIdentity;
  /**
   * Workflow steps to use in order to bootstrap this repo.
   * @default "yarn install --frozen-lockfile && yarn projen"
   * @stability experimental
   */
  readonly workflowBootstrapSteps?: Array<github.workflows.JobStep>;
  /**
   * Automatically release to npm when new versions are introduced.
   * @default false
   * @stability experimental
   */
  readonly releaseToNpm?: boolean;
  /**
   * Add release management to this project.
   * @default - true (false for subprojects)
   * @stability experimental
   */
  readonly release?: boolean;
  /**
   * The contents of the pull request template.
   * @default - default content
   * @stability experimental
   */
  readonly pullRequestTemplateContents?: Array<string>;
  /**
   * Include a GitHub pull request template.
   * @default true
   * @stability experimental
   */
  readonly pullRequestTemplate?: boolean;
  /**
   * Version of projen to install.
   * @default - Defaults to the latest version.
   * @stability experimental
   */
  readonly projenVersion?: string;
  /**
   * Options for .projenrc.js.
   * @default - default options
   * @stability experimental
   */
  readonly projenrcJsOptions?: javascript.ProjenrcOptions;
  /**
   * Generate (once) .projenrc.js (in JavaScript). Set to `false` in order to disable .projenrc.js generation.
   * @default - true if projenrcJson is false
   * @stability experimental
   */
  readonly projenrcJs?: boolean;
  /**
   * Indicates of "projen" should be installed as a devDependency.
   * @default true
   * @stability experimental
   */
  readonly projenDevDependency?: boolean;
  /**
   * Prettier options.
   * @default - default options
   * @stability experimental
   */
  readonly prettierOptions?: javascript.PrettierOptions;
  /**
   * Setup prettier.
   * @default false
   * @stability experimental
   */
  readonly prettier?: boolean;
  /**
   * Defines a `package` task that will produce an npm tarball under the artifacts directory (e.g. `dist`).
   * @default true
   * @stability experimental
   */
  readonly package?: boolean;
  /**
   * Configuration options for .npmignore file.
   * @stability experimental
   */
  readonly npmIgnoreOptions?: IgnoreFileOptions;
  /**
   * Defines an .npmignore file. Normally this is only needed for libraries that are packaged as tarballs.
   * @default true
   * @stability experimental
   */
  readonly npmignoreEnabled?: boolean;
  /**
   * Automatically update files modified during builds to pull-request branches.
   * This means
   * that any files synthesized by projen or e.g. test snapshots will always be up-to-date
   * before a PR is merged.
   *
   * Implies that PR builds do not have anti-tamper checks.
   * @default true
   * @stability experimental
   */
  readonly mutableBuild?: boolean;
  /**
   * Jest options.
   * @default - default options
   * @stability experimental
   */
  readonly jestOptions?: javascript.JestOptions;
  /**
   * Setup jest unit tests.
   * @default true
   * @stability experimental
   */
  readonly jest?: boolean;
  /**
   * Additional entries to .gitignore.
   * @stability experimental
   */
  readonly gitignore?: Array<string>;
  /**
   * Options for `UpgradeDependencies`.
   * @default - default options
   * @stability experimental
   */
  readonly depsUpgradeOptions?: javascript.UpgradeDependenciesOptions;
  /**
   * Use github workflows to handle dependency upgrades.
   * Cannot be used in conjunction with `dependabot`.
   * @default true
   * @stability experimental
   */
  readonly depsUpgrade?: boolean;
  /**
   * Options for dependabot.
   * @default - default options
   * @stability experimental
   */
  readonly dependabotOptions?: github.DependabotOptions;
  /**
   * Use dependabot to handle dependency upgrades.
   * Cannot be used in conjunction with `depsUpgrade`.
   * @default false
   * @stability experimental
   */
  readonly dependabot?: boolean;
  /**
   * The copyright years to put in the LICENSE file.
   * @default - current year
   * @stability experimental
   */
  readonly copyrightPeriod?: string;
  /**
   * License copyright owner.
   * @default - defaults to the value of authorName or "" if `authorName` is undefined.
   * @stability experimental
   */
  readonly copyrightOwner?: string;
  /**
   * Define the secret name for a specified https://codecov.io/ token A secret is required to send coverage for private repositories.
   * @default - if this option is not specified, only public repositories are supported
   * @stability experimental
   */
  readonly codeCovTokenSecret?: string;
  /**
   * Define a GitHub workflow step for sending code coverage metrics to https://codecov.io/ Uses codecov/codecov-action@v3 A secret is required for private repos. Configured with @codeCovTokenSecret.
   * @default false
   * @stability experimental
   */
  readonly codeCov?: boolean;
  /**
   * Options for `Bundler`.
   * @stability experimental
   */
  readonly bundlerOptions?: javascript.BundlerOptions;
  /**
   * Build workflow triggers.
   * @default "{ pullRequest: {}, workflowDispatch: {} }"
   * @stability experimental
   */
  readonly buildWorkflowTriggers?: github.workflows.Triggers;
  /**
   * Define a GitHub workflow for building PRs.
   * @default - true if not a subproject
   * @stability experimental
   */
  readonly buildWorkflow?: boolean;
  /**
   * Automatically approve deps upgrade PRs, allowing them to be merged by mergify (if configued).
   * Throw if set to true but `autoApproveOptions` are not defined.
   * @default - true
   * @stability experimental
   */
  readonly autoApproveUpgrades?: boolean;
  /**
   * A directory which will contain build artifacts.
   * @default "dist"
   * @stability experimental
   */
  readonly artifactsDirectory?: string;
  /**
   * The name of the main release branch.
   * @default "main"
   * @stability experimental
   */
  readonly defaultReleaseBranch?: string;
  /**
   * Github Runner selection labels.
   * @default ["ubuntu-latest"]
   * @stability experimental
   */
  readonly workflowRunsOn?: Array<string>;
  /**
   * Container image to use for GitHub workflows.
   * @default - default image
   * @stability experimental
   */
  readonly workflowContainerImage?: string;
  /**
   * Custom configuration used when creating changelog with standard-version package.
   * Given values either append to default configuration or overwrite values in it.
   * @default - standard configuration applicable for GitHub repositories
   * @stability experimental
   */
  readonly versionrcOptions?: Record<string, any>;
  /**
   * A set of workflow steps to execute in order to setup the workflow container.
   * @stability experimental
   */
  readonly releaseWorkflowSetupSteps?: Array<github.workflows.JobStep>;
  /**
   * The name of the default release workflow.
   * @default "Release"
   * @stability experimental
   */
  readonly releaseWorkflowName?: string;
  /**
   * The release trigger to use.
   * @default - Continuous releases (`ReleaseTrigger.continuous()`)
   * @stability experimental
   */
  readonly releaseTrigger?: release.ReleaseTrigger;
  /**
   * Automatically add the given prefix to release tags. Useful if you are releasing on multiple branches with overlapping version numbers.
   * Note: this prefix is used to detect the latest tagged version
   * when bumping, so if you change this on a project with an existing version
   * history, you may need to manually tag your latest release
   * with the new prefix.
   * @default "v"
   * @stability experimental
   */
  readonly releaseTagPrefix?: string;
  /**
   * The label to apply to issues indicating publish failures.
   * Only applies if `releaseFailureIssue` is true.
   * @default "failed-release"
   * @stability experimental
   */
  readonly releaseFailureIssueLabel?: string;
  /**
   * Create a github issue on every failed publishing task.
   * @default false
   * @stability experimental
   */
  readonly releaseFailureIssue?: boolean;
  /**
   * Defines additional release branches.
   * A workflow will be created for each
   * release branch which will publish releases from commits in this branch.
   * Each release branch _must_ be assigned a major version number which is used
   * to enforce that versions published from that branch always use that major
   * version. If multiple branches are used, the `majorVersion` field must also
   * be provided for the default branch.
   * @default - no additional branches are used for release. you can use
`addBranch()` to add additional branches.
   * @stability experimental
   */
  readonly releaseBranches?: Record<string, release.BranchOptions>;
  /**
   * Define publishing tasks that can be executed manually as well as workflows.
   * Normally, publishing only happens within automated workflows. Enable this
   * in order to create a publishing task for each publishing activity.
   * @default false
   * @stability experimental
   */
  readonly publishTasks?: boolean;
  /**
   * Instead of actually publishing to package managers, just print the publishing command.
   * @default false
   * @stability experimental
   */
  readonly publishDryRun?: boolean;
  /**
   * Bump versions from the default branch as pre-releases (e.g. "beta", "alpha", "pre").
   * @default - normal semantic versions
   * @stability experimental
   */
  readonly prerelease?: string;
  /**
   * Steps to execute after build as part of the release workflow.
   * @default []
   * @stability experimental
   */
  readonly postBuildSteps?: Array<github.workflows.JobStep>;
  /**
   * The npmDistTag to use when publishing from the default branch.
   * To set the npm dist-tag for release branches, set the `npmDistTag` property
   * for each branch.
   * @default "latest"
   * @stability experimental
   */
  readonly npmDistTag?: string;
  /**
   * Minimal Major version to release.
   * This can be useful to set to 1, as breaking changes before the 1.x major
   * release are not incrementing the major version number.
   *
   * Can not be set together with `majorVersion`.
   * @default - No minimum version is being enforced
   * @stability experimental
   */
  readonly minMajorVersion?: number;
  /**
   * Major version to release from the default branch.
   * If this is specified, we bump the latest version of this major version line.
   * If not specified, we bump the global latest version.
   * @default - Major version is not enforced.
   * @stability experimental
   */
  readonly majorVersion?: number;
  /**
   * Version requirement of `publib` which is used to publish modules to npm.
   * @default "latest"
   * @stability experimental
   */
  readonly jsiiReleaseVersion?: string;
  /**
   * Package's Stability.
   * @stability experimental
   */
  readonly stability?: string;
  /**
   * Options for privately hosted scoped packages.
   * @default - fetch all scoped packages from the public npm registry
   * @stability experimental
   */
  readonly scopedPackagesOptions?: Array<javascript.ScopedPackagesOptions>;
  /**
   * If the package.json for your package is not in the root directory (for example if it is part of a monorepo), you can specify the directory in which it lives.
   * @stability experimental
   */
  readonly repositoryDirectory?: string;
  /**
   * The repository is the location where the actual code for your package lives.
   * See https://classic.yarnpkg.com/en/docs/package-json/#toc-repository
   * @stability experimental
   */
  readonly repository?: string;
  /**
   * The version of PNPM to use if using PNPM as a package manager.
   * @default "7"
   * @stability experimental
   */
  readonly pnpmVersion?: string;
  /**
   * Peer dependencies for this module.
   * Dependencies listed here are required to
   * be installed (and satisfied) by the _consumer_ of this library. Using peer
   * dependencies allows you to ensure that only a single module of a certain
   * library exists in the `node_modules` tree of your consumers.
   *
   * Note that prior to npm@7, peer dependencies are _not_ automatically
   * installed, which means that adding peer dependencies to a library will be a
   * breaking change for your customers.
   *
   * Unless `peerDependencyOptions.pinnedDevDependency` is disabled (it is
   * enabled by default), projen will automatically add a dev dependency with a
   * pinned version for each peer dependency. This will ensure that you build &
   * test your module against the lowest peer version required.
   * @default []
   * @stability experimental
   */
  readonly peerDeps?: Array<string>;
  /**
   * Options for `peerDeps`.
   * @stability experimental
   */
  readonly peerDependencyOptions?: javascript.PeerDependencyOptions;
  /**
   * The "name" in package.json.
   * @default - defaults to project name
   * @stability experimental
   * @featured true
   */
  readonly packageName?: string;
  /**
   * The Node Package Manager used to execute scripts.
   * @default NodePackageManager.YARN
   * @stability experimental
   */
  readonly packageManager?: javascript.NodePackageManager;
  /**
   * GitHub secret which contains the NPM token to use when publishing packages.
   * @default "NPM_TOKEN"
   * @stability experimental
   */
  readonly npmTokenSecret?: string;
  /**
   * The base URL of the npm package registry.
   * Must be a URL (e.g. start with "https://" or "http://")
   * @default "https://registry.npmjs.org"
   * @stability experimental
   */
  readonly npmRegistryUrl?: string;
  /**
   * Access level of the npm package.
   * @default - for scoped packages (e.g. `foo@bar`), the default is
`NpmAccess.RESTRICTED`, for non-scoped packages, the default is
`NpmAccess.PUBLIC`.
   * @stability experimental
   */
  readonly npmAccess?: javascript.NpmAccess;
  /**
   * Minimum Node.js version to require via package.json `engines` (inclusive).
   * @default - no "engines" specified
   * @stability experimental
   */
  readonly minNodeVersion?: string;
  /**
   * Minimum node.js version to require via `engines` (inclusive).
   * @default - no max
   * @stability experimental
   */
  readonly maxNodeVersion?: string;
  /**
   * Indicates if a license should be added.
   * @default true
   * @stability experimental
   */
  readonly licensed?: boolean;
  /**
   * License's SPDX identifier.
   * See https://github.com/projen/projen/tree/main/license-text for a list of supported licenses.
   * Use the `licensed` option if you want to no license to be specified.
   * @default "Apache-2.0"
   * @stability experimental
   */
  readonly license?: string;
  /**
   * Keywords to include in `package.json`.
   * @stability experimental
   */
  readonly keywords?: Array<string>;
  /**
   * Package's Homepage / Website.
   * @stability experimental
   */
  readonly homepage?: string;
  /**
   * Module entrypoint (`main` in `package.json`).
   * Set to an empty string to not include `main` in your package.json
   * @default "lib/index.js"
   * @stability experimental
   */
  readonly entrypoint?: string;
  /**
   * Build dependencies for this module.
   * These dependencies will only be
   * available in your build environment but will not be fetched when this
   * module is consumed.
   *
   * The recommendation is to only specify the module name here (e.g.
   * `express`). This will behave similar to `yarn add` or `npm install` in the
   * sense that it will add the module as a dependency to your `package.json`
   * file with the latest version (`^`). You can specify semver requirements in
   * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
   * this will be what you `package.json` will eventually include.
   * @default []
   * @stability experimental
   * @featured true
   */
  readonly devDeps?: Array<string>;
  /**
   * The description is just a string that helps people understand the purpose of the package.
   * It can be used when searching for packages in a package manager as well.
   * See https://classic.yarnpkg.com/en/docs/package-json/#toc-description
   * @stability experimental
   * @featured true
   */
  readonly description?: string;
  /**
   * Runtime dependencies of this module.
   * The recommendation is to only specify the module name here (e.g.
   * `express`). This will behave similar to `yarn add` or `npm install` in the
   * sense that it will add the module as a dependency to your `package.json`
   * file with the latest version (`^`). You can specify semver requirements in
   * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
   * this will be what you `package.json` will eventually include.
   * @default []
   * @stability experimental
   * @featured true
   */
  readonly deps?: Array<string>;
  /**
   * Options for npm packages using AWS CodeArtifact.
   * This is required if publishing packages to, or installing scoped packages from AWS CodeArtifact
   * @default - undefined
   * @stability experimental
   */
  readonly codeArtifactOptions?: javascript.CodeArtifactOptions;
  /**
   * List of dependencies to bundle into this module.
   * These modules will be
   * added both to the `dependencies` section and `bundledDependencies` section of
   * your `package.json`.
   *
   * The recommendation is to only specify the module name here (e.g.
   * `express`). This will behave similar to `yarn add` or `npm install` in the
   * sense that it will add the module as a dependency to your `package.json`
   * file with the latest version (`^`). You can specify semver requirements in
   * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
   * this will be what you `package.json` will eventually include.
   * @stability experimental
   */
  readonly bundledDeps?: Array<string>;
  /**
   * The url to your project's issue tracker.
   * @stability experimental
   */
  readonly bugsUrl?: string;
  /**
   * The email address to which issues should be reported.
   * @stability experimental
   */
  readonly bugsEmail?: string;
  /**
   * Binary programs vended with your module.
   * You can use this option to add/customize how binaries are represented in
   * your `package.json`, but unless `autoDetectBin` is `false`, every
   * executable file under `bin` will automatically be added to this section.
   * @stability experimental
   */
  readonly bin?: Record<string, string>;
  /**
   * Automatically add all executables under the `bin` directory to your `package.json` file under the `bin` section.
   * @default true
   * @stability experimental
   */
  readonly autoDetectBin?: boolean;
  /**
   * Author's URL / Website.
   * @stability experimental
   */
  readonly authorUrl?: string;
  /**
   * Is the author an organization.
   * @stability experimental
   */
  readonly authorOrganization?: boolean;
  /**
   * Author's name.
   * @stability experimental
   */
  readonly authorName?: string;
  /**
   * Author's e-mail.
   * @stability experimental
   */
  readonly authorEmail?: string;
  /**
   * Allow the project to include `peerDependencies` and `bundledDependencies`.
   * This is normally only allowed for libraries. For apps, there's no meaning
   * for specifying these.
   * @default true
   * @stability experimental
   */
  readonly allowLibraryDependencies?: boolean;
  /**
   * Enable VSCode integration.
   * Enabled by default for root projects. Disabled for non-root projects.
   * @default true
   * @stability experimental
   */
  readonly vscode?: boolean;
  /**
   * Auto-close stale issues and pull requests.
   * To disable set `stale` to `false`.
   * @default - see defaults in `StaleOptions`
   * @stability experimental
   */
  readonly staleOptions?: github.StaleOptions;
  /**
   * Auto-close of stale issues and pull request.
   * See `staleOptions` for options.
   * @default false
   * @stability experimental
   */
  readonly stale?: boolean;
  /**
   * The README setup.
   * @default - { filename: 'README.md', contents: '# replace this' }
   * @stability experimental
   */
  readonly readme?: SampleReadmeProps;
  /**
   * Choose a method of providing GitHub API access for projen workflows.
   * @default - use a personal access token named PROJEN_GITHUB_TOKEN
   * @stability experimental
   */
  readonly projenCredentials?: github.GithubCredentials;
  /**
   * Add a Gitpod development environment.
   * @default false
   * @stability experimental
   */
  readonly gitpod?: boolean;
  /**
   * Options for GitHub integration.
   * @default - see GitHubOptions
   * @stability experimental
   */
  readonly githubOptions?: github.GitHubOptions;
  /**
   * Enable GitHub integration.
   * Enabled by default for root projects. Disabled for non-root projects.
   * @default true
   * @stability experimental
   */
  readonly github?: boolean;
  /**
   * Add a VSCode development environment (used for GitHub Codespaces).
   * @default false
   * @stability experimental
   */
  readonly devContainer?: boolean;
  /**
   * Add a `clobber` task which resets the repo to origin.
   * @default - true, but false for subprojects
   * @stability experimental
   */
  readonly clobber?: boolean;
  /**
   * Configure options for automatic merging on GitHub.
   * Has no effect if
   * `github.mergify` or `autoMerge` is set to false.
   * @default - see defaults in `AutoMergeOptions`
   * @stability experimental
   */
  readonly autoMergeOptions?: github.AutoMergeOptions;
  /**
   * Enable automatic merging on GitHub.
   * Has no effect if `github.mergify`
   * is set to false.
   * @default true
   * @stability experimental
   */
  readonly autoMerge?: boolean;
  /**
   * Enable and configure the 'auto approve' workflow.
   * @default - auto approve is disabled
   * @stability experimental
   */
  readonly autoApproveOptions?: github.AutoApproveOptions;
  /**
   * Options for renovatebot.
   * @default - default options
   * @stability experimental
   */
  readonly renovatebotOptions?: RenovatebotOptions;
  /**
   * Use renovatebot to handle dependency upgrades.
   * @default false
   * @stability experimental
   */
  readonly renovatebot?: boolean;
  /**
   * Options for .projenrc.json.
   * @default - default options
   * @stability experimental
   */
  readonly projenrcJsonOptions?: ProjenrcJsonOptions;
  /**
   * Generate (once) .projenrc.json (in JSON). Set to `false` in order to disable .projenrc.json generation.
   * @default false
   * @stability experimental
   */
  readonly projenrcJson?: boolean;
  /**
   * The shell command to use in order to run the projen CLI.
   * Can be used to customize in special environments.
   * @default "npx projen"
   * @stability experimental
   */
  readonly projenCommand?: string;
  /**
   * The parent project, if this project is part of a bigger project.
   * @stability experimental
   */
  readonly parent?: Project;
  /**
   * The root directory of the project.
   * Relative to this directory, all files are synthesized.
   *
   * If this project has a parent, this directory is relative to the parent
   * directory and it cannot be the same as the parent or any of it's other
   * sub-projects.
   * @default "."
   * @stability experimental
   */
  readonly outdir?: string;
  /**
   * Configure logging options such as verbosity.
   * @default {}
   * @stability experimental
   */
  readonly logging?: LoggerOptions;
  /**
   * Configuration options for git.
   * @stability experimental
   */
  readonly gitOptions?: GitOptions;
  /**
   * Configuration options for .gitignore file.
   * @stability experimental
   */
  readonly gitIgnoreOptions?: IgnoreFileOptions;
  /**
   * Whether to commit the managed files by default.
   * @default true
   * @stability experimental
   */
  readonly commitGenerated?: boolean;
  /**
   * This is the name of your project.
   * @stability experimental
   * @featured true
   */
  readonly name: string;
}
