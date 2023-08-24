import path from 'node:path'
import {
	applyOverrides,
	cwdRelativePath,
	firstAncestor,
	isComponent,
} from '@arroyodev-llc/utils.projen'
import { Component, javascript, type Project, type typescript } from 'projen'
import { deepMerge } from 'projen/lib/util'

export interface TypescriptConfigContainerOptions {
	/**
	 * Root directory for extendable configs.
	 * @default '.'
	 */
	readonly configsDirectory?: string
}

export interface TypescriptConfigContainerBuildOptions
	extends Partial<javascript.TypescriptConfigOptions> {
	/**
	 * Override strategy.
	 * Only applicable when {@link projen#javascript.TypescriptConfigOptions.fileName} exists.
	 * @remarks
	 * 'merge-files' - Unique merge of only 'include' and 'exclude'
	 * 'merge' - Deep merge entire config.
	 * 'overwrite' - Overwrite entire config.
	 * 'fail' - Throw error.
	 *
	 * @default 'fail'
	 *
	 */
	override?: 'merge-files' | 'merge' | 'overwrite' | 'fail'
	/**
	 * Overrides to apply to compiler options.
	 */
	compilerOptionsOverrides?: Record<string, unknown>
}

export class TypescriptConfigContainer extends Component {
	public static of(project: Project): TypescriptConfigContainer | undefined {
		const isTsConfigContainer = (
			c: Component,
		): c is TypescriptConfigContainer => c instanceof TypescriptConfigContainer
		return project.components.find(isTsConfigContainer)
	}

	/**
	 * Find the nearest config container up project ancestry or create one.
	 * @param project target project.
	 * @param options {@link TypescriptConfigContainerOptions} used to create new config container if needed.
	 */
	public static ensure(
		project: Project,
		options?: TypescriptConfigContainerOptions,
	): TypescriptConfigContainer {
		return (
			this.nearest(project) ?? new TypescriptConfigContainer(project, options)
		)
	}

	/**
	 * Find nearest config container up project ancestry.
	 * @param project
	 */
	public static nearest(
		project: Project,
	): TypescriptConfigContainer | undefined {
		return firstAncestor(project, (parent: Project) =>
			TypescriptConfigContainer.of(parent),
		)
	}

	/**
	 * Mapping of reusable configs.
	 */
	public readonly configs: Map<string, javascript.TypescriptConfig> = new Map()

	/**
	 * Mapping of project paths that will be established
	 * during pre synthesis.
	 */
	readonly projectPaths: Map<
		typescript.TypeScriptProject,
		Set<typescript.TypeScriptProject>
	> = new Map()

	readonly projectReferences: Map<
		typescript.TypeScriptProject,
		Set<typescript.TypeScriptProject>
	> = new Map()

	constructor(
		project: Project,
		public readonly options: TypescriptConfigContainerOptions = {
			configsDirectory: '.',
		},
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
		options: javascript.TypeScriptCompilerOptions,
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
	defineConfig<
		Options extends javascript.TypeScriptCompilerOptions & {
			overrides?: Record<string, unknown>
		},
	>(name: string, options: Options) {
		const configPath = this.#resolvePath(name)
		const { overrides, ...configOptions } = options
		const config = this.buildExtendableTypeScriptConfig(
			configPath,
			configOptions,
		)
		if (overrides) {
			applyOverrides(
				config.file,
				{
					compilerOptions: overrides,
				},
				{ extendArrays: true },
			)
		}
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

	/**
	 * Merge two tsconfig include/exclude files.
	 * @param base Base config.
	 * @param paths Override config.
	 */
	mergeTsConfigFiles<ConfigT extends { include: string[]; exclude: string[] }>(
		base?: ConfigT,
		paths?: { include?: string[]; exclude?: string[] },
	): { include: string[]; exclude: string[] } {
		const uniqMerge = <T>(arrA: T[], arrB: T[]): T[] =>
			Array.from(new Set([...arrA.slice(), ...arrB.slice()]))
		return {
			include: uniqMerge((base?.include ?? []).slice(), paths?.include ?? []),
			exclude: uniqMerge((base?.exclude ?? []).slice(), paths?.exclude ?? []),
		}
	}

	/**
	 * Merge two tsconfig objects.
	 * @param base Base config.
	 * @param override Override config.
	 */
	mergeTsConfigs(
		base: javascript.TypescriptConfigOptions,
		override: javascript.TypescriptConfigOptions,
	) {
		return deepMerge(
			[base, override],
			true,
		) as javascript.TypescriptConfigOptions
	}

	/**
	 * Build {@link projen#javascript.TypescriptConfig} from options.
	 * @param project Parent project.
	 * @param options {@link TypescriptConfigContainerBuildOptions}
	 */
	buildConfig(
		project: Project,
		options: TypescriptConfigContainerBuildOptions,
	): javascript.TypescriptConfig {
		const {
			fileName = 'tsconfig.json',
			compilerOptions = {},
			override = 'fail',
			include,
			exclude,
			extends: baseExtends,
			compilerOptionsOverrides,
		} = options

		const existing = project.components.find(
			(c) =>
				isComponent(javascript.TypescriptConfig, c) && c.fileName === fileName,
		) as javascript.TypescriptConfig | undefined

		let props: javascript.TypescriptConfigOptions = {
			fileName,
			compilerOptions,
			...(override === 'merge-files'
				? this.mergeTsConfigFiles(existing, { include, exclude })
				: {
						...(include ? { include } : {}),
						...(exclude ? { exclude } : {}),
				  }),
			extends: baseExtends,
		}

		if (existing && override === 'merge') {
			props = this.mergeTsConfigs(
				{
					fileName: existing.fileName,
					...(existing.extends.length
						? {
								extends: javascript.TypescriptConfigExtends.fromPaths(
									existing.extends,
								),
						  }
						: {}),
					include: existing.include,
					exclude: existing.exclude,
					compilerOptions: existing.compilerOptions,
				},
				Object.assign({}, props),
			)
		}

		// projen will throw if we try to write to an existing file,
		// so only need to handle when override is not 'fail'.
		if (existing && override !== 'fail') {
			project.tryRemoveFile(existing.fileName)
		}

		const finalConfig = new javascript.TypescriptConfig(project, props)
		if (compilerOptionsOverrides) {
			applyOverrides(finalConfig.file, {
				compilerOptions: compilerOptionsOverrides,
			})
		}
		return finalConfig
	}

	/**
	 * Add paths reference from one project to another in tsconfig.json
	 * @param fromProject Target to add path to.
	 * @param toProject Target of the path.
	 * @protected
	 */
	protected linkProjectTsPath(
		fromProject: typescript.TypeScriptProject,
		toProject: typescript.TypeScriptProject,
	) {
		const tsPath = cwdRelativePath(
			fromProject.outdir,
			path.join(path.join(toProject.outdir, toProject.srcdir), 'index'),
		)
		if (!fromProject.tsconfig) {
			this.project.logger.warn(
				`Cannot add tsconfig path (${fromProject.name} -> ${toProject.name}) because ${fromProject.name} does not have a tsconfig!`,
			)
			return
		}
		const depNamePath = toProject.package.packageName.replaceAll('.', '\\.')
		fromProject.tsconfig.file.addOverride(
			`compilerOptions.paths.${depNamePath}`,
			[tsPath],
		)
	}

	/**
	 * Build tsconfig project reference object.
	 * @param fromProject Target to add reference to.
	 * @param toProject Reference target.
	 * @protected
	 */
	protected buildReference(
		fromProject: typescript.TypeScriptProject,
		toProject: typescript.TypeScriptProject,
	) {
		if (!fromProject.tsconfig) {
			this.project.logger.warn(
				`Cannot add tsconfig path (${fromProject.name} -> ${toProject.name}) because ${fromProject.name} does not have a tsconfig!`,
			)
			return
		}
		const configPath = cwdRelativePath(
			fromProject.outdir,
			path.join(toProject.outdir, toProject.tryFindFile('tsconfig.json')!.path),
		)
		fromProject.logger.debug(
			`Adding tsconfig reference -> ${toProject.name}@${configPath}`,
		)
		return { path: configPath }
	}

	/**
	 * Apply all tsconfig paths.
	 * @protected
	 */
	protected applyTsConfigPaths() {
		this.projectPaths.forEach((toProjects, fromProject) => {
			toProjects.forEach((toProj) =>
				this.linkProjectTsPath(fromProject, toProj),
			)
		})
		this.projectPaths.clear()
	}

	/**
	 * Apply all tsconfig references.
	 * @protected
	 */
	protected applyTsProjectReferences() {
		this.projectReferences.forEach((toProjects, fromProject) => {
			const references = Array.from(toProjects)
				.map((toProj) => this.buildReference(fromProject, toProj))
				.filter(Boolean)
			fromProject.tsconfig!.file.addOverride('references', references)
		})
		this.projectReferences.clear()
	}

	/**
	 * Add tsconfig path entries for the given projects.
	 * @param fromProject Target project to modify.
	 * @param toProjects Projects to reference.
	 */
	addTsConfigPaths(
		fromProject: typescript.TypeScriptProject,
		toProjects: typescript.TypeScriptProject[],
	): this {
		const current = this.projectPaths.get(fromProject) ?? []
		this.projectPaths.set(fromProject, new Set([...current, ...toProjects]))
		return this
	}

	/**
	 * Add tsconfig reference entries for the given projects.
	 * @param fromProject Target project to modify.
	 * @param toProjects Projects to reference.
	 */
	addTsConfigReferences(
		fromProject: typescript.TypeScriptProject,
		toProjects: typescript.TypeScriptProject[],
	): this {
		const current = this.projectReferences.get(fromProject) ?? []
		this.projectReferences.set(
			fromProject,
			new Set([...current, ...toProjects]),
		)
		return this
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		this.applyTsConfigPaths()
		this.applyTsProjectReferences()
		super.preSynthesize()
	}
}
