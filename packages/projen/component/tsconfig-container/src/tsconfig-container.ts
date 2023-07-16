import path from 'node:path'
import { firstAncestor, isComponent } from '@arroyodev-llc/utils.projen'
import { Component, javascript, type Project } from 'projen'

export interface TypescriptConfigContainerOptions {
	/**
	 * Root directory for extendable configs.
	 * @default '.'
	 */
	readonly configsDirectory?: string
}

export class TypescriptConfigContainer extends Component {
	public static of(project: Project): TypescriptConfigContainer | undefined {
		const isTsConfigContainer = (
			c: Component
		): c is TypescriptConfigContainer => c instanceof TypescriptConfigContainer
		return project.components.find(isTsConfigContainer)
	}

	public static ensure(
		project: Project,
		options?: TypescriptConfigContainerOptions
	): TypescriptConfigContainer {
		return this.of(project) ?? new TypescriptConfigContainer(project, options)
	}

	/**
	 * Find nearest config container up project ancestry.
	 * @param project
	 */
	public static nearest(
		project: Project
	): TypescriptConfigContainer | undefined {
		return firstAncestor(project, (parent: Project) =>
			TypescriptConfigContainer.of(parent)
		)
	}

	public readonly configs: Map<string, javascript.TypescriptConfig> = new Map()

	constructor(
		project: Project,
		public readonly options: TypescriptConfigContainerOptions = {
			configsDirectory: '.',
		}
	) {
		super(project)
	}

	#resolvePath(name: string): string {
		const fileName = `tsconfig.${name}.json`
		return path.join(this.options.configsDirectory ?? '.', fileName)
	}

	/**
	 * Build tsconfig primed for extending.
	 * @param fileName File name of tsconfig.
	 * @param options Compiler options.
	 */
	buildExtendableTypeScriptConfig(
		fileName: string,
		options: javascript.TypeScriptCompilerOptions
	): javascript.TypescriptConfig {
		const config = new javascript.TypescriptConfig(this.project, {
			fileName,
			compilerOptions: options,
		})
		config.file.addDeletionOverride('include')
		config.file.addDeletionOverride('exclude')
		return config
	}

	/**
	 * Define a new config.
	 * @param name Name of tsconfig.
	 * @param options Compiler options.
	 */
	defineConfig(name: string, options: javascript.TypeScriptCompilerOptions) {
		const configPath = this.#resolvePath(name)
		const config = this.buildExtendableTypeScriptConfig(configPath, options)
		this.configs.set(name, config)
		return this
	}

	/**
	 * Build `TypescriptConfigExtends` object from configs.
	 * @param names
	 */
	buildExtends(...names: string[]): javascript.TypescriptConfigExtends {
		const configs = names.map((name) => {
			const config = this.configs.get(name)
			if (!config) throw new Error(`No config found with name: ${name}!`)
			return config
		})
		return javascript.TypescriptConfigExtends.fromTypescriptConfigs(configs)
	}
}
