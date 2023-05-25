import {
	TypeScriptSourceConfig,
	type TypeScriptSourceConfigPlugin,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import { findComponent } from '@arroyodev-llc/utils.projen'
import {
	Component,
	DependencyType,
	JsonPatch,
	type Project,
	type typescript,
} from 'projen'
import { deepMerge } from 'projen/lib/util'
import type { Config } from 'tailwindcss/types'

export interface TailwindOptions {
	/**
	 * Tailwind config file path.
	 * @default 'tailwind.js'
	 */
	filePath?: string
	/**
	 * Tailwind config.
	 */
	config?: Config
}

export class Tailwind extends Component {
	public static of(project: Project): Tailwind | undefined {
		return findComponent(project, Tailwind)
	}

	readonly file: TypeScriptSourceConfig<Config>
	readonly options: Required<TailwindOptions>

	constructor(
		project: typescript.TypeScriptProject,
		options?: TailwindOptions
	) {
		super(project)

		this.options = deepMerge([
			{
				filePath: 'tailwind.config.mjs',
				config: {
					content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
				},
			} as TailwindOptions,
			options,
		]) as Required<TailwindOptions>

		this.project.deps.addDependency('tailwindcss', DependencyType.RUNTIME)

		this.file = new TypeScriptSourceConfig<Config>(
			project,
			this.options.filePath,
			{
				source: [
					`/** @type {import('tailwindcss').Config} */`,
					'export default {}',
				].join('\n'),
				recreate: true,
				config: this.options.config,
				pluginsProperty: 'plugins',
				marker: true,
			}
		)
		this.file.tsconfigFile.patch(
			JsonPatch.add('/include/-', this.options.filePath)
		)

		if (options?.config) {
			this.addConfig(options.config)
		}
	}

	addPlugin(plugin: TypeScriptSourceConfigPlugin): this {
		this.file.addPlugin(plugin)
		return this
	}

	addConfig(config: Config): this {
		this.file.addConfig(config)
		return this
	}
}
