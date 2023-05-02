import { existsSync, readFileSync } from 'fs'
import path from 'node:path'
import { findComponent } from '@arroyodev-llc/utils.projen'
import { Component, github, JsonFile, type Project } from 'projen'
import { secretToString } from 'projen/lib/github/util'
import { kebabCaseKeys } from 'projen/lib/util'

export const enum ReleaseType {
	NODE = 'node',
	PYTHON = 'python',
}

export interface ReleasePleasePackage {
	readonly releaseType?: ReleaseType
	readonly releaseAs?: string
	readonly packageName?: string
	readonly changelogPath?: string
	readonly changelogHost?: string
}

export interface ReleasePleaseChangelogSection {
	readonly type: string
	readonly section: string
	readonly hidden?: boolean
}

export interface ReleasePleasePlugin {
	readonly type: string
}

/**
 * Release Please manifest.
 */
export interface ReleasePleaseManifest {
	/**
	 * Default release-type.
	 */
	readonly releaseType?: ReleaseType
	/**
	 * Release as draft.
	 */
	readonly prerelease?: boolean
	readonly includeVInTag?: boolean
	readonly bumpMinorPreMajor?: boolean
	readonly bumpPatchForMinorPreMajor?: boolean
	readonly changelogType?: string
	readonly changelogSections?: ReleasePleaseChangelogSection[]
	readonly plugins?: ReleasePleasePlugin[]
	/**
	 * Packages to release.
	 */
	packages: Record<string, ReleasePleasePackage>
}

export interface ReleasePleaseWorkflowOptions {
	workflow?: github.GithubWorkflow
}

/**
 * Release Please component options.
 */
export interface ReleasePleaseOptions {
	readonly manifestConfig: ReleasePleaseManifest
}

const configDefaults: ReleasePleaseManifest = {
	includeVInTag: true,
	bumpMinorPreMajor: true,
	bumpPatchForMinorPreMajor: true,
	packages: {
		'.': {},
	},
	changelogSections: [
		{
			type: 'feat',
			section: 'Features',
		},
		{
			type: 'feature',
			section: 'Features',
		},
		{
			type: 'fix',
			section: 'Bug Fixes',
		},
		{
			type: 'perf',
			section: 'Performance Improvements',
		},
		{
			type: 'revert',
			section: 'Reverts',
		},
		{
			type: 'docs',
			section: 'Documentation',
			hidden: false,
		},
		{
			type: 'style',
			section: 'Styles',
			hidden: true,
		},
		{
			type: 'chore',
			section: 'Miscellaneous Chores',
			hidden: true,
		},
		{
			type: 'refactor',
			section: 'Code Refactoring',
			hidden: false,
		},
		{
			type: 'test',
			section: 'Tests',
			hidden: false,
		},
		{
			type: 'build',
			section: 'Build System',
			hidden: false,
		},
		{
			type: 'ci',
			section: 'Continuous Integration',
			hidden: false,
		},
	],
	plugins: [{ type: 'sentence-case' }],
}

export class ReleasePleaseWorkflow extends Component {
	readonly workflow: github.GithubWorkflow

	constructor(
		project: Project,
		public readonly options: ReleasePleaseWorkflowOptions
	) {
		super(project)

		this.workflow =
			options.workflow ??
			new github.GithubWorkflow(github.GitHub.of(this.project)!, 'Release')

		this.workflow.on({
			push: { branches: ['main'] },
		})

		const steps: github.workflows.JobStep[] = [
			{
				uses: 'actions/checkout@v3',
				with: {
					'persist-credentials': false,
				},
			},
			...this.workflow.projenCredentials.setupSteps,
			this.releasePleaseStep,
			{
				name: 'Setup PNPM',
				if: this.releasesCreatedRef,
				uses: 'pnpm/action-setup@v2.2.4',
				with: {
					version: '8',
				},
			},
			{
				name: 'Setup Node',
				if: this.releasesCreatedRef,
				uses: 'actions/setup-node@v3',
				with: {
					'node-version': '16',
					cache: 'pnpm',
				},
			},
			{
				name: 'Install Dependencies',
				if: this.releasesCreatedRef,
				run: 'pnpm install --no-frozen-lockfile',
			},
			{
				name: 'Build',
				if: this.releasesCreatedRef,
				run: 'pnpm build',
			},
			{
				name: 'Publish',
				if: this.releasesCreatedRef,
				env: {
					NODE_AUTH_TOKEN: secretToString('NPM_AUTH_TOKEN'),
					NPM_TOKEN: secretToString('NPM_AUTH_TOKEN'),
				},
				run: `pnpm --parallel -r exec bash -c '([[ -d "dist/js" ]] && pnpm --package=publib@latest dlx publib-npm) || echo "No dist found: $(pwd)"'`,
			},
		]

		this.workflow.addJob('release-please', {
			name: 'Release Please',
			runsOn: ['ubuntu-latest'],
			permissions: {
				contents: github.workflows.JobPermission.WRITE,
				pullRequests: github.workflows.JobPermission.WRITE,
			},
			steps,
		})
	}

	get releasePleaseStep(): github.workflows.JobStep {
		return {
			name: 'Release Please',
			id: 'release-please',
			uses: 'google-github-actions/release-please-action@v3',
			with: {
				token: this.workflow.projenCredentials.tokenRef,
				command: 'manifest',
			},
		}
	}

	get releasesCreatedRef(): string {
		return '${{ steps.release-please.outputs.releases_created }}'
	}
}

export class ReleasePlease extends Component {
	static of(project: Project): ReleasePlease | undefined {
		return findComponent(project, ReleasePlease)
	}

	readonly releaseWorkflow: ReleasePleaseWorkflow
	readonly configFile: JsonFile
	readonly manifestFile: JsonFile

	readonly #manifestConfig: ReleasePleaseManifest
	readonly #packagePaths: Map<string, string> = new Map()
	readonly #packages: Map<string, string> = new Map()

	constructor(
		project: Project,
		public readonly options?: ReleasePleaseOptions
	) {
		super(project)

		this.#manifestConfig = {
			...configDefaults,
			...(options?.manifestConfig ?? {}),
		}

		this.configFile = new JsonFile(this.project, 'release-please-config.json', {
			readonly: true,
			committed: true,
			marker: false,
			allowComments: false,
			omitEmpty: true,
			obj: () => kebabCaseKeys(this.#manifestConfig),
		})

		this.manifestFile = this.buildManifest()

		this.releaseWorkflow = new ReleasePleaseWorkflow(this.project, {})
	}

	protected buildManifest() {
		const manifestFile = path.join(
			this.project.outdir,
			'.release-please-manifest.json'
		)
		if (existsSync(manifestFile)) {
			const data = JSON.parse(readFileSync(manifestFile, 'utf-8')) as Record<
				string,
				string
			>
			for (const [key, value] of Object.entries(data)) {
				this.#packages.set(key, value)
			}
		}
		return new JsonFile(this.project, '.release-please-manifest.json', {
			readonly: false,
			marker: false,
			omitEmpty: false,
			allowComments: false,
			obj: () => Object.fromEntries(this.#packages.entries()),
		})
	}

	/**
	 * Mapping of package project names to manifest versions.
	 */
	get packages(): Map<string, string> {
		const pkgs = new Map<string, string>()
		for (const [key, value] of this.#packages.entries()) {
			const pkgName = this.#packagePaths.get(key) ?? key
			pkgs.set(pkgName, value)
		}
		return pkgs
	}

	addPackage(
		packagePath: string,
		spec: ReleasePleasePackage,
		version?: string
	): this {
		this.#manifestConfig.packages = {
			...this.#manifestConfig.packages,
			[packagePath]: spec,
		}
		if (version) {
			this.#packages.set(packagePath, version)
		}
		return this
	}

	addProject(
		project: Project,
		options?: ReleasePleasePackage,
		version?: string
	): this {
		let relPath = project.parent
			? path.relative(project.parent.outdir, project.outdir)
			: '.'
		this.#packagePaths.set(relPath, project.name)
		return this.addPackage(relPath, options ?? {}, version)
	}
}
