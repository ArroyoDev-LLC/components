import { Component, type Project } from 'projen'
import { type NodeProject } from 'projen/lib/javascript'

/**
 * Common extension matches.
 */
export const enum ExtensionMatch {
	TS = 'ts,tsx,mts,cts',
	JS = 'js,jsx,jts,jts',
	YAML = 'yaml,yml',
	JSON = 'json',
}

export interface LintStagedEntry {
	/**
	 * File extensions to match.
	 */
	extensions: Array<ExtensionMatch | string> | string
	/**
	 * Commands to run.
	 */
	commands: string[]
}

export interface LintStagedOptions {
	/**
	 * Lint staged entries.
	 */
	readonly entries?: LintStagedEntry[]
}

/**
 * Lint staged.
 */
export class LintStaged extends Component {
	public static of(project: Project): LintStaged | undefined {
		const isLintStaged = (o: Component): o is LintStaged =>
			o instanceof LintStaged
		return project.components.find(isLintStaged)
	}

	#entries: LintStagedEntry[]

	constructor(readonly project: NodeProject, options: LintStagedOptions = {}) {
		super(project)
		this.#entries = options.entries ?? []
		this.project.addDevDeps('lint-staged')
	}

	protected applyPackage(): this {
		this.project.package.addField('lint-staged', this.lintStagedConfig)
		return this
	}

	/**
	 * Lint Staged configuration.
	 */
	get lintStagedConfig(): Record<string, string[]> {
		return this.#entries.reduce((acc, { extensions, commands }) => {
			const key = Array.isArray(extensions)
				? `*.{${extensions.join(',')}}`
				: extensions
			acc[key] ??= []
			acc[key]!.push(...commands)
			return acc
		}, {} as Record<string, string[]>)
	}

	/**
	 * Add target to lint-staged config.
	 * @param target Config entry.
	 */
	addLintStagedTarget(target: LintStagedEntry): this {
		this.#entries.push(target)
		return this
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		super.preSynthesize()
		this.applyPackage()
	}
}
