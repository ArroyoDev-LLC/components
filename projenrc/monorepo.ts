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
import { type GitHub } from 'projen/lib/github'
import { type NpmConfig } from 'projen/lib/javascript'

export class ComponentsMonorepo extends MonorepoProject {
	public readonly lintConfig: LintConfig
	public readonly vitest: Vitest
	public releasePlease!: ReleasePlease
	public readonly toolVersions: ToolVersions

	constructor(options: NxMonorepoProjectOptions) {
		super(options)
		this.lintConfig = new LintConfig(this)
		this.vitest = new Vitest(this, {
			configType: VitestConfigType.WORKSPACE,
			settings: {
				test: { threads: true },
			},
		})
		this.toolVersions = new ToolVersions(this, {
			tools: {
				nodejs: ['18.15.0', 'lts'],
				pnpm: ['8.5.1'],
			},
		})
		this.pnpm.addPatch(
			'@mrgrain/jsii-struct-builder@0.4.3',
			'patches/@mrgrain__jsii-struct-builder@0.4.3.patch'
		)
	}

	protected applyNx(): this {
		super.applyNx()
		// readonly access token (safe to be public)
		this.nx.useNxCloud(
			'NTc0NTE5MGItNjY3Ni00YmQzLTg0YTUtNWFkMzc5ZWZiY2Y4fHJlYWQtb25seQ=='
		)
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
