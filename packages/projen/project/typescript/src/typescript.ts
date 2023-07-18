import {
	LintConfig,
	type LintConfigOptions,
} from '@arroyodev-llc/projen.component.linting'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import {
	ReleasePlease,
	ReleaseType,
} from '@arroyodev-llc/projen.component.release-please'
import { TypescriptConfigContainer } from '@arroyodev-llc/projen.component.tsconfig-container'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import {
	MonorepoProject,
	TSConfig,
} from '@arroyodev-llc/projen.project.nx-monorepo'
import { ProjectName } from '@arroyodev-llc/utils.projen'
import {
	BaseBuildStep,
	builders,
	ProjectBuilder,
	type TypedPropertyDescriptorMap,
} from '@arroyodev-llc/utils.projen-builder'
import { NodePackageUtils } from '@aws-prototyping-sdk/nx-monorepo'
import {
	type Component,
	DependencyType,
	javascript,
	LogLevel,
	type ProjectOptions,
	typescript,
} from 'projen'
import { deepMerge } from 'projen/lib/util'
import type { TypeScriptProjectOptions } from './typescript-project-options'

export const CONFIG_DEFAULTS = {
	defaultReleaseBranch: 'main',
	packageManager: javascript.NodePackageManager.PNPM,
	pnpmVersion: '8',
	npmAccess: javascript.NpmAccess.PUBLIC,
	release: true,
	releaseToNpm: true,
	jest: false,
	projenDevDependency: false,
	entrypoint: 'dist/index.mjs',
	entrypointTypes: 'dist/index.d.ts',
	libdir: 'dist',
	typescriptVersion: '^5',
	authorEmail: 'support@arroyodev.com',
	authorUrl: 'https://arroyodev.com',
	authorName: 'arroyoDev-LLC',
	authorOrganization: true,
	logging: { usePrefix: true, level: LogLevel.INFO },
	projenCommand: NodePackageUtils.command.exec(
		javascript.NodePackageManager.PNPM,
		'projen'
	),
	projenrcTs: true,
	prettier: true,
	unbuild: true,
} satisfies Omit<TypeScriptProjectOptions, 'name'>

interface TypescriptConfigBuilderProps {
	readonly tsconfigContainer: TypescriptConfigContainer
	readonly tsconfig: javascript.TypescriptConfig
	readonly tsconfigDev: javascript.TypescriptConfig
}

export class TypescriptConfigBuilder extends BaseBuildStep<
	{ readonly tsconfigBase?: javascript.TypescriptConfigExtends },
	TypescriptConfigBuilderProps
> {
	protected tsconfigBase: javascript.TypescriptConfigExtends | undefined =
		undefined
	protected projectOptions!: typescript.TypeScriptProjectOptions

	constructor(
		readonly options?: {
			extendsDefault: (
				container: TypescriptConfigContainer
			) => javascript.TypescriptConfigExtends
		}
	) {
		super()
	}

	applyOptions<Options extends typescript.TypeScriptProjectOptions>(
		options: Options & this['outputOptionsType']
	): Options & this['outputOptionsType'] {
		const { tsconfigBase, ...rest } = options
		this.tsconfigBase = tsconfigBase
		this.projectOptions = rest
		return options
	}

	applyProject(
		project: typescript.TypeScriptProject
	): TypedPropertyDescriptorMap<this['outputType']> {
		const tsconfigContainer =
			TypescriptConfigContainer.nearest(project) ??
			TypescriptConfigContainer.ensure(project)
		const tsconfigBase =
			this.tsconfigBase ?? this.options?.extendsDefault?.(tsconfigContainer)
		const srcDir = project.srcdir
		const tsconfig = tsconfigContainer.buildConfig(project, {
			fileName: 'tsconfig.json',
			compilerOptions: {
				outDir: project.libdir ?? 'dist',
				...(this.projectOptions.tsconfig?.compilerOptions ?? {}),
			},
			...(tsconfigBase && { extends: tsconfigBase }),
			override: 'merge-files',
			include: [`${srcDir}/*.ts`, `${srcDir}/**/*.ts`],
		})
		const tsconfigDev = tsconfigContainer.buildConfig(project, {
			fileName: 'tsconfig.dev.json',
			extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([
				tsconfig,
			]),
			override: 'merge-files',
			include: [...tsconfig.include, '*.ts', '**/*.ts'],
			exclude: ['node_modules'],
			...(this.projectOptions.tsconfigDev && {
				compilerOptions: this.projectOptions.tsconfigDev.compilerOptions,
			}),
		})
		return {
			tsconfig: { writable: false, value: tsconfig },
			tsconfigDev: { writable: false, value: tsconfigDev },
			tsconfigContainer: { writable: false, value: tsconfigContainer },
		} as TypedPropertyDescriptorMap<this['outputType']>
	}
}

export class TypescriptESMManifestBuilder extends BaseBuildStep<
	{},
	{
		addWorkspaceDeps(
			...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>
		): void
		formatExecCommand(...args: string[]): string
	}
> {
	constructor(readonly options?: { sideEffects: boolean }) {
		super()
	}

	applyProject(
		project: typescript.TypeScriptProject
	): TypedPropertyDescriptorMap<this['outputType']> {
		project.package.addField('type', 'module')
		project.package.addField('sideEffects', this.options?.sideEffects ?? false)
		project.tasks.tryFind('package')?.reset?.()
		return {
			addWorkspaceDeps: {
				value(...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>) {
					return PnpmWorkspace.of(this)?.addWorkspaceDeps?.(...dependency)
				},
			},
			formatExecCommand: {
				value(this: typescript.TypeScriptProject, ...args: string[]) {
					return NodePackageUtils.command.exec(
						this.package.packageManager,
						...args
					)
				},
			},
		} as TypedPropertyDescriptorMap<this['outputType']>
	}
}

export class TypescriptBundlerBuilder extends BaseBuildStep<
	{ readonly unbuild?: boolean },
	{ readonly unbuild?: UnBuild | undefined }
> {
	private unbuild: boolean = false

	applyOptions(
		options: ProjectOptions & this['outputOptionsType']
	): ProjectOptions & this['outputOptionsType'] {
		const { unbuild, ...rest } = options
		this.unbuild = unbuild ?? false
		return super.applyOptions(rest)
	}

	applyProject(
		project: typescript.TypeScriptProject
	): TypedPropertyDescriptorMap<this['outputType']> {
		if (this.unbuild) {
			project.tasks
				.tryFind('post-compile')!
				.exec('unbuild', { name: 'Unbuild' })
			const unbuild = new UnBuild(project, {
				cjs: true,
				options: {
					name: project.name,
					declaration: true,
					clean: true,
					entries: ['./src/index'],
					rollup: {
						emitCJS: true,
						cjsBridge: true,
						esbuild: {
							treeShaking: true,
							sourcemap: true,
						},
					},
				},
			})
			return {
				unbuild: { writable: false, value: unbuild },
			} as TypedPropertyDescriptorMap<this['outputType']>
		}
		return super.applyProject(project)
	}
}

export class TypescriptLintingBuilder extends BaseBuildStep<
	{},
	{ readonly lintConfig: LintConfig }
> {
	constructor(readonly options?: LintConfigOptions) {
		super()
	}

	applyProject(
		project: typescript.TypeScriptProject
	): TypedPropertyDescriptorMap<this['outputType']> {
		const lintConfig = new LintConfig(project, this.options)
		lintConfig.setEslintExec('eslint --cache')
		return {
			lintConfig: { writable: false, value: lintConfig },
		} as TypedPropertyDescriptorMap<this['outputType']>
	}
}

export class TypescriptReleasePleaseBuilder extends BaseBuildStep<{}, {}> {
	applyProject(
		project: typescript.TypeScriptProject
	): TypedPropertyDescriptorMap<this['outputType']> {
		const releasePlease = ReleasePlease.of(project.parent ?? project)
		if (releasePlease) {
			releasePlease.addProject(project, { releaseType: ReleaseType.NODE })
			const version = releasePlease.packages.get(project.name)
			if (version) {
				project.package.addVersion(version)
			} else {
				releasePlease.addProject(
					project,
					{ releaseType: ReleaseType.NODE },
					'0.0.0'
				)
			}
		}
		return super.applyProject(project)
	}
}

export const TypescriptBaseBuilder = new ProjectBuilder(
	typescript.TypeScriptProject
)
	.add(new builders.DefaultOptionsBuilder(CONFIG_DEFAULTS))
	.add(
		new TypescriptConfigBuilder({
			extendsDefault: (container) =>
				container.buildExtends(TSConfig.BASE, TSConfig.ESM, TSConfig.BUNDLER),
		})
	)
	.add(new TypescriptESMManifestBuilder())
	.add(new TypescriptBundlerBuilder())
	.add(new TypescriptLintingBuilder({ useTypeInformation: true }))
	.add(new TypescriptReleasePleaseBuilder())

export class TypescriptProject extends typescript.TypeScriptProject {
	/**
	 * Create new package under monorepo parent.
	 * @param monorepo Parent monorepo project.
	 * @param options Project options.
	 */
	static fromParent(
		monorepo: MonorepoProject,
		options: TypeScriptProjectOptions
	) {
		const { tsconfigBase, ...rest } = options
		return new this({
			parent: monorepo,
			tsconfigBase:
				tsconfigBase ??
				monorepo.tsconfigContainer.buildExtends(
					TSConfig.BASE,
					TSConfig.ESM,
					TSConfig.BUNDLER
				),
			...rest,
		})
	}

	public readonly projectName: ProjectName
	public readonly tsconfigContainer: TypescriptConfigContainer
	public readonly tsconfig: javascript.TypescriptConfig
	public readonly tsconfigDev: javascript.TypescriptConfig
	public readonly lintConfig: LintConfig
	public readonly pnpm: PnpmWorkspace
	public readonly options: TypeScriptProjectOptions

	constructor(options: TypeScriptProjectOptions) {
		const { name, workspaceDeps, tsconfigBase, tsconfig, ...rest } = options
		let projectName: ProjectName = new ProjectName(name)
		if (options.parent && options.parent instanceof MonorepoProject) {
			projectName = options.parent.nameScheme(name)
		}
		const mergedOptions = deepMerge(
			[Object.assign({}, CONFIG_DEFAULTS), rest],
			true
		) as Omit<TypeScriptProjectOptions, 'name'>
		super({
			defaultReleaseBranch: 'main',
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			...mergedOptions,
			tsconfig,
		})
		this.options = mergedOptions as TypeScriptProjectOptions
		this.projectName = projectName
		this.pnpm = new PnpmWorkspace(this)

		this.tsconfigContainer =
			TypescriptConfigContainer.nearest(this) ??
			TypescriptConfigContainer.ensure(this)

		const srcDir = this.options.srcdir ?? 'src'
		this.tsconfig = this.tsconfigContainer.buildConfig(this, {
			fileName: 'tsconfig.json',
			compilerOptions: {
				outDir: this.options.libdir ?? 'dist',
				...(tsconfig?.compilerOptions ?? {}),
			},
			extends: tsconfigBase,
			override: 'merge-files',
			include: [`${srcDir}/*.ts`, `${srcDir}/**/*.ts`],
		})
		this.tsconfigDev = this.tsconfigContainer.buildConfig(this, {
			fileName: 'tsconfig.dev.json',
			extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([
				this.tsconfig,
			]),
			override: 'merge-files',
			include: [...this.tsconfig.include, '*.ts', '**/*.ts'],
			exclude: ['node_modules'],
		})

		this.addWorkspaceDeps(
			{ depType: DependencyType.RUNTIME, addTsPath: true },
			...(workspaceDeps ?? [])
		)

		this.lintConfig = new LintConfig(this)

		this.applyLintConfig()
			.applyPackage()
			.applyReleasePlease(ReleasePlease.of(this.parent ?? this))
			.applyBundler()
			.applyPackageTask()
	}

	protected applyPackage(): this {
		this.package.addField('type', 'module')
		this.package.addField('sideEffects', false)
		return this
	}

	protected buildUnbuild(): Component {
		return new UnBuild(this, {
			cjs: true,
			options: {
				name: this.projectName.packageName,
				declaration: true,
				clean: true,
				entries: ['./src/index'],
				rollup: {
					emitCJS: true,
					cjsBridge: true,
					esbuild: {
						treeShaking: true,
						sourcemap: true,
					},
				},
			},
		})
	}

	protected applyBundler(): this {
		if (this.options.unbuild) {
			this.tasks.tryFind('post-compile')!.exec('unbuild', { name: 'Unbuild' })
			this.buildUnbuild()
		}
		return this
	}

	protected applyPackageTask(): this {
		this.tasks.tryFind('package')?.reset?.()
		return this
	}

	protected applyLintConfig(): this {
		LintConfig.of(this)!.setEslintExec('eslint --cache')
		return this
	}

	protected applyReleasePlease(releasePlease?: ReleasePlease): this {
		if (!releasePlease) return this
		releasePlease.addProject(this, { releaseType: ReleaseType.NODE })
		const version = releasePlease.packages.get(this.name)
		if (version) {
			this.package.addVersion(version)
		} else {
			releasePlease.addProject(this, { releaseType: ReleaseType.NODE }, '0.0.0')
		}
		return this
	}

	addWorkspaceDeps(
		...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>
	) {
		return PnpmWorkspace.of(this)!.addWorkspaceDeps(...dependency)
	}

	/**
	 * Format executable command with project package manager.
	 * @param args command args.
	 */
	formatExecCommand(...args: string[]): string {
		return NodePackageUtils.command.exec(this.package.packageManager, ...args)
	}
}
