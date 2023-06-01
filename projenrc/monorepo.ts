import { DirEnv } from '@arroyodev-llc/projen.component.dir-env'
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
import { github } from 'projen'
import { type GitHub } from 'projen/lib/github'
import { type NpmConfig } from 'projen/lib/javascript'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

export class ComponentsMonorepo extends MonorepoProject {
	static readonly githubCredentials = arroyoBot
	static readonly nxPublicReadonlyToken: string =
		'NTc0NTE5MGItNjY3Ni00YmQzLTg0YTUtNWFkMzc5ZWZiY2Y4fHJlYWQtb25seQ=='

	public readonly lintConfig: LintConfig
	public readonly vitest: Vitest
	public releasePlease!: ReleasePlease
	public readonly toolVersions: ToolVersions
	public readonly envrc: DirEnv

	constructor(options: NxMonorepoProjectOptions) {
		super({
			projenCredentials: ComponentsMonorepo.githubCredentials,
			githubOptions: {
				projenCredentials: ComponentsMonorepo.githubCredentials,
			},
			minNodeVersion: '18.16.0',
			namingScheme: {
				scope: '@arroyodev-llc',
			},
			...options,
		})
		this.lintConfig = new LintConfig(this)
		this.vitest = new Vitest(this, {
			configType: VitestConfigType.WORKSPACE,
			settings: {
				test: { threads: true },
			},
		})
		this.toolVersions = new ToolVersions(this, {
			// TODO: resolve from project.
			tools: {
				nodejs: ['18.16.0'],
				pnpm: ['8.6.0'],
			},
		})
		this.envrc = new DirEnv(this, { fileName: '.envrc' })
			.buildDefaultEnvRc({
				localEnvRc: '.envrc.local',
				minDirEnvVersion: '2.32.1',
			})
			.addComment('Required Env Vars for this project')
			.addEnvVar('NPM_TOKEN', '', { defaultValue: '' })
			.addComment('NX Access Token (can override with write-enabled token)')
			.addEnvVar('NX_CLOUD_ACCESS_TOKEN', '', {
				defaultValue: ComponentsMonorepo.nxPublicReadonlyToken,
			})
		this.pnpm.addPatch(
			'@mrgrain/jsii-struct-builder@0.4.3',
			'patches/@mrgrain__jsii-struct-builder@0.4.3.patch'
		)
	}

	protected applyNx(): this {
		super.applyNx()
		// readonly access token (safe to be public)
		this.nx.useNxCloud(ComponentsMonorepo.nxPublicReadonlyToken)
		return this
	}

	protected applyGithub(gh: GitHub): this {
		this.releasePlease = new ReleasePlease(this).addPlugin({
			type: 'node-workspace',
		})
		this.applyGithubJobNxEnv(
			this.releasePlease.releaseWorkflow.workflow,
			'release-please'
		)
		return super.applyGithub(gh)
	}

	protected applyNpmConfig(npmConfig: NpmConfig): this {
		super.applyNpmConfig(npmConfig)
		npmConfig.addConfig('//registry.npmjs.org/:_authToken', '${NPM_TOKEN}')
		return this
	}
}
