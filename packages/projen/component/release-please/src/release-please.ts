import path from 'node:path'
import { findComponent } from '@arroyodev-llc/utils.projen'
import { Component, JsonFile, type Project } from 'projen'
import { Release } from 'projen/lib/release'
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
	readonly packages: Record<string, ReleasePleasePackage>
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

export class ReleasePlease extends Component {
	static of(project: Project): ReleasePlease | undefined {
		return findComponent(project, ReleasePlease)
	}

	readonly configFile: JsonFile
	readonly manifestFile: JsonFile

	private readonly _manifestConfig: ReleasePleaseManifest

	constructor(
		project: Project,
		public readonly options?: ReleasePleaseOptions
	) {
		super(project)

		this._manifestConfig = {
			...configDefaults,
			...(options?.manifestConfig ?? {}),
		}

		this.configFile = new JsonFile(this.project, 'release-please-config.json', {
			readonly: true,
			committed: true,
			marker: false,
			allowComments: false,
			omitEmpty: true,
			obj: () => kebabCaseKeys(this._manifestConfig),
		})

		this.manifestFile = new JsonFile(
			this.project,
			'.release-please-manifest.json',
			{
				readonly: false,
				marker: false,
				omitEmpty: false,
				allowComments: false,
				obj: {},
			}
		)
	}

	addPackage(packagePath: string, spec: ReleasePleasePackage): this {
		this._manifestConfig.packages = {
			...this._manifestConfig.packages,
			[packagePath]: spec,
		}
		return this
	}

	addProject(project: Project, options?: ReleasePleasePackage): this {
		let relPath = project.parent
			? path.relative(project.parent.outdir, project.outdir)
			: '.'
		return this.addPackage(relPath, options ?? {})
	}
}
