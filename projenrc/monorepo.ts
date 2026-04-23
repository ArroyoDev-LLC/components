import { DirEnv } from '@arroyodev-llc/projen.component.dir-env'
import {
	ExtensionMatch,
	GitHooks,
	LintStaged,
	ValidGitHooks,
} from '@arroyodev-llc/projen.component.git-hooks'
import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { ReleasePlease } from '@arroyodev-llc/projen.component.release-please'
import { ToolVersions } from '@arroyodev-llc/projen.component.tool-versions'
import {
	Vitest,
	VitestConfigType,
} from '@arroyodev-llc/projen.component.vitest'
import {
	MonorepoProject,
	type NxMonorepoProjectOptions,
} from '@arroyodev-llc/projen.project.nx-monorepo'
import {
	type ProjectNameSchemeOptions,
	type SupportsNameScheme,
} from '@arroyodev-llc/utils.projen'
import { NodePackageUtils } from '@aws/pdk/monorepo'
import { github } from 'projen'
import { type GitHub } from 'projen/lib/github'
import { type NpmConfig } from 'projen/lib/javascript'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

export class ComponentsMonorepo
	extends MonorepoProject
	implements SupportsNameScheme
{
	static readonly githubCredentials = arroyoBot
	static readonly nxPublicReadonlyToken: string =
		'NTc0NTE5MGItNjY3Ni00YmQzLTg0YTUtNWFkMzc5ZWZiY2Y4fHJlYWQtb25seQ=='
	// prefers write-scope token on main-branch push; falls back to read-only
	// on PRs, forks, and when the write secret is absent.
	static readonly nxCloudAccessTokenExpression: string =
		"${{ (github.event_name == 'push' && github.ref == 'refs/heads/main') && secrets.NX_CLOUD_AUTH_TOKEN_WRITE || secrets.NX_CLOUD_ACCESS_TOKEN }}"

	public readonly lintConfig: LintConfig
	public readonly vitest: Vitest
	public releasePlease!: ReleasePlease
	public readonly toolVersions: ToolVersions
	public readonly envrc: DirEnv
	public readonly gitHooks: GitHooks
	public readonly namingScheme: ProjectNameSchemeOptions

	constructor(options: NxMonorepoProjectOptions) {
		super({
			projenCredentials: ComponentsMonorepo.githubCredentials,
			workflowGitIdentity: {
				name: '${{ vars.AD_BOT_GIT_USER }}',
				email: '${{ vars.AD_BOT_GIT_EMAIL }}',
			},
			githubOptions: {
				projenCredentials: ComponentsMonorepo.githubCredentials,
			},
			minNodeVersion: '24.14.1',
			namingScheme: {
				scope: '@arroyodev-llc',
			},
			...options,
		})
		this.namingScheme = this.options.namingScheme!
		this.lintConfig = new LintConfig(this)
		this.vitest = new Vitest(this, {
			configType: VitestConfigType.WORKSPACE,
			settings: {
				test: { pool: 'threads' },
			},
		})
		this.toolVersions = new ToolVersions(this, {
			tools: {
				nodejs: [this.package.minNodeVersion ?? 'lts'],
				pnpm: [this.package.pnpmVersion ?? '8.6.0'],
			},
		})
		this.applyRecursive(
			(project) => {
				if (NodePackageUtils.isNodeProject(project)) {
					new LintStaged(project, {
						entries: [
							{
								extensions: [ExtensionMatch.TS, ExtensionMatch.TS],
								commands: [
									NodePackageUtils.command.exec(
										this.package.packageManager,
										'eslint --no-error-on-unmatched-pattern --fix',
									),
								],
							},
							{
								extensions: [ExtensionMatch.YAML],
								commands: [
									NodePackageUtils.command.exec(
										this.package.packageManager,
										'prettier --write',
									),
								],
							},
						],
					})
				}
			},
			{ immediate: false, includeSelf: true },
		)
		this.gitHooks = new GitHooks(this, {
			hooks: {
				[ValidGitHooks.PreCommit]: NodePackageUtils.command.exec(
					this.package.packageManager,
					'lint-staged',
				),
			},
		})
		this.envrc = new DirEnv(this, { fileName: '.envrc' })
			.buildDefaultEnvRc({
				localEnvRc: '.envrc.local',
				minDirEnvVersion: '2.32.1',
				nixFlakeSupport: true,
			})
			.addComment('Required Env Vars for this project')
			.addEnvVar('NPM_TOKEN', '', { defaultValue: '' })
			.addComment('NX Access Token (can override with write-enabled token)')
			.addEnvVar('NX_CLOUD_ACCESS_TOKEN', '', {
				defaultValue: ComponentsMonorepo.nxPublicReadonlyToken,
			})
		this.addGitIgnore('!/flake.nix')
		this.addGitIgnore('!/flake.lock')
		this.nx.setTargetDefault('compile', {
			dependsOn: ['^compile'],
		})
		this.applyAffectedAwareBuildTask()
	}

	/**
	 * Rewrite the root `build` task to be affected-aware via env vars.
	 * CI sets NX_AFFECTED_MODE=affected + base/head SHAs for PRs; push events
	 * leave them empty and the task falls back to `nx run-many`.
	 */
	protected applyAffectedAwareBuildTask(): this {
		this.tasks
			.tryFind('build')
			?.reset(
				'pnpm exec nx ${NX_AFFECTED_MODE:-run-many} --target=build' +
					' --output-style=stream --nx-bail' +
					' ${NX_AFFECTED_BASE:+--base=$NX_AFFECTED_BASE}' +
					' ${NX_AFFECTED_HEAD:+--head=$NX_AFFECTED_HEAD}',
				{ receiveArgs: true },
			)
		return this
	}

	protected applyNx(): this {
		super.applyNx()
		const nxJson = this.tryFindObjectFile('nx.json')
		if (nxJson) {
			nxJson.addOverride(
				'nxCloudAccessToken',
				ComponentsMonorepo.nxPublicReadonlyToken,
			)
			nxJson.addOverride('useDaemonProcess', true)
			// granular namedInputs so doc/test edits don't bust build cache
			nxJson.addOverride('namedInputs.production', [
				'{projectRoot}/src/**/*',
				'{projectRoot}/build.config.ts',
				'{projectRoot}/tsconfig*.json',
				'{projectRoot}/package.json',
				'!{projectRoot}/test/**/*',
				'!{projectRoot}/**/*.spec.*',
				'!{projectRoot}/dist/**/*',
			])
			nxJson.addOverride('namedInputs.test', [
				'{projectRoot}/test/**/*',
				'{projectRoot}/vitest.config.ts',
				'{projectRoot}/**/*.spec.*',
			])
			nxJson.addOverride('namedInputs.docs', [
				'{projectRoot}/README.md',
				'{projectRoot}/**/*.md',
			])
			// shared tsconfig + projenrc invalidate every package's cache
			nxJson.addOverride('namedInputs.sharedConfig', [
				'{workspaceRoot}/tsconfig/*.json',
				'{workspaceRoot}/.projenrc.ts',
				'{workspaceRoot}/projenrc/**/*.ts',
			])
			nxJson.addOverride('targetDefaults.build', {
				inputs: ['production', '^production', 'sharedConfig'],
				outputs: ['{projectRoot}/dist', '{projectRoot}/coverage'],
				dependsOn: ['^build'],
			})
			nxJson.addOverride('targetDefaults.compile', {
				inputs: ['production', '^production', 'sharedConfig'],
				dependsOn: ['^compile'],
			})
			nxJson.addOverride('targetDefaults.package', {
				inputs: ['production', '^production', 'sharedConfig'],
				outputs: ['{projectRoot}/dist'],
				dependsOn: ['build'],
			})
			nxJson.addOverride('targetDefaults.test', {
				inputs: ['production', 'test', '^production', 'sharedConfig'],
				outputs: ['{projectRoot}/coverage', '{projectRoot}/test-reports'],
				dependsOn: ['^build'],
			})
			nxJson.addOverride('targetDefaults.eslint', {
				inputs: ['production', 'test', 'sharedConfig'],
			})
			// @nx/js/typescript plugin: import-based graph edges.
			// No target inference — we keep projen-owned build/compile/test targets.
			nxJson.addOverride('plugins', [
				{
					plugin: '@nx/js/typescript',
					options: {},
				},
			])
		}
		return this
	}

	protected applyGithub(gh: GitHub): this {
		this.releasePlease = new ReleasePlease(this).addPlugin({
			type: 'node-workspace',
		})
		this.applyGithubJobNxEnv(
			this.releasePlease.releaseWorkflow.workflow,
			'release-please',
		)
		// release workflow always runs on main — always prefer write token.
		this.releasePlease.releaseWorkflow.workflow.file.addOverride(
			'jobs.release-please.env.NX_CLOUD_ACCESS_TOKEN',
			'${{ secrets.NX_CLOUD_AUTH_TOKEN_WRITE || secrets.NX_CLOUD_ACCESS_TOKEN }}',
		)
		super.applyGithub(gh)
		this.applyAffectedAwareBuildEnv(gh)
		return this
	}

	/**
	 * Populate NX_AFFECTED_* env on the build workflow so PR runs hit
	 * `nx affected` (base/head SHAs) while push/manual runs fall through to
	 * `nx run-many`.
	 */
	protected applyAffectedAwareBuildEnv(gh: GitHub): this {
		const build = gh.tryFindWorkflow('build')
		if (!build) return this
		build.file.addOverride(
			'jobs.build.env.NX_AFFECTED_MODE',
			"${{ github.event_name == 'pull_request' && 'affected' || 'run-many' }}",
		)
		build.file.addOverride(
			'jobs.build.env.NX_AFFECTED_BASE',
			'${{ github.event.pull_request.base.sha }}',
		)
		build.file.addOverride(
			'jobs.build.env.NX_AFFECTED_HEAD',
			'${{ github.event.pull_request.head.sha }}',
		)
		// nx affected needs base SHA present locally; default shallow clone would miss it.
		build.file.addOverride('jobs.build.steps.0.with.fetch-depth', 0)
		// prefer write-scope token on main pushes so cache is warmed; fall back
		// to read-only token on PRs/forks. NX_CLOUD_AUTH_TOKEN_WRITE is
		// optional — absent secret gracefully degrades to read-only.
		build.file.addOverride(
			'jobs.build.env.NX_CLOUD_ACCESS_TOKEN',
			ComponentsMonorepo.nxCloudAccessTokenExpression,
		)
		return this
	}

	protected applyNpmConfig(npmConfig: NpmConfig): this {
		super.applyNpmConfig(npmConfig)
		npmConfig.addConfig('//registry.npmjs.org/:_authToken', '${NPM_TOKEN}')
		return this
	}
}
