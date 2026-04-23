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
		return super.applyGithub(gh)
	}

	protected applyNpmConfig(npmConfig: NpmConfig): this {
		super.applyNpmConfig(npmConfig)
		npmConfig.addConfig('//registry.npmjs.org/:_authToken', '${NPM_TOKEN}')
		return this
	}
}
