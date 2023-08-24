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
	BaseBuildStep,
	type TypedPropertyDescriptorMap,
} from '@arroyodev-llc/utils.projen-builder'
import { NodePackageUtils } from '@aws-prototyping-sdk/nx-monorepo'
import {
	DependencyType,
	javascript,
	type ProjectOptions,
	type typescript,
} from 'projen'

export interface TypescriptConfigBuilderProps {
	readonly tsconfigContainer: TypescriptConfigContainer
	readonly tsconfig: javascript.TypescriptConfig
	readonly tsconfigDev: javascript.TypescriptConfig
}

/**
 * Build tsconfig files using container.
 */
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
				container: TypescriptConfigContainer,
			) => javascript.TypescriptConfigExtends
		},
	) {
		super()
	}

	applyOptions<Options extends typescript.TypeScriptProjectOptions>(
		options: Options & this['_outputOptions'],
	): Options {
		const { tsconfigBase, ...rest } = options
		this.tsconfigBase = tsconfigBase
		this.projectOptions = rest
		return options
	}

	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		const tsconfigContainer = TypescriptConfigContainer.ensure(project)
		const tsconfigBase =
			this.tsconfigBase ?? this.options?.extendsDefault?.(tsconfigContainer)
		const srcDir = project.srcdir
		project.addGitIgnore('dist-types')
		const tsconfig = tsconfigContainer.buildConfig(project, {
			fileName: 'tsconfig.json',
			compilerOptions: {
				rootDir: project.srcdir,
				outDir: project.libdir ?? 'dist',
				declarationDir: 'dist-types',
				...(this.projectOptions.tsconfig?.compilerOptions ?? {}),
			},
			compilerOptionsOverrides: {
				tsBuildInfoFile: 'tsconfig.tsbuildinfo',
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
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

export class TypescriptESMManifestBuilder extends BaseBuildStep<
	{
		readonly workspaceDeps?: Array<string | javascript.NodeProject> | undefined
	},
	{
		readonly pnpm: PnpmWorkspace
		addWorkspaceDeps(
			...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>
		): void
		formatExecCommand(...args: string[]): string
	}
> {
	private workspaceDeps: Array<string | javascript.NodeProject> | undefined

	constructor(readonly options?: { sideEffects: boolean }) {
		super()
	}

	applyOptions(
		options: ProjectOptions & this['_outputOptions'],
	): ProjectOptions & this['_outputOptions'] {
		const { workspaceDeps, ...rest } = options
		this.workspaceDeps = workspaceDeps
		return super.applyOptions(rest)
	}

	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		project.package.addField('type', 'module')
		project.package.addField('sideEffects', this.options?.sideEffects ?? false)
		project.tasks.tryFind('package')?.reset?.()
		const pnpm = new PnpmWorkspace(project)
		if (this.workspaceDeps) {
			const tsContainer = TypescriptConfigContainer.ensure(project)
			const targets = this.workspaceDeps.filter(
				(dep) => dep instanceof javascript.NodeProject,
			) as typescript.TypeScriptProject[]
			tsContainer.addTsConfigReferences(project, targets)
			pnpm.addWorkspaceDeps?.(
				{ depType: DependencyType.RUNTIME, addTsPath: true },
				...(this.workspaceDeps ?? []),
			)
		}
		return {
			pnpm: { writable: false, value: pnpm },
			addWorkspaceDeps: {
				value(...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>) {
					TypescriptConfigContainer.ensure(project).addTsConfigReferences(
						project,
						dependency.filter(
							(i) => i instanceof javascript.NodeProject,
						) as typescript.TypeScriptProject[],
					)
					return PnpmWorkspace.of(project)?.addWorkspaceDeps?.(...dependency)
				},
			},
			formatExecCommand: {
				value(this: typescript.TypeScriptProject, ...args: string[]) {
					return NodePackageUtils.command.exec(
						project.package.packageManager,
						...args,
					)
				},
			},
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

export class TypescriptBundlerBuilder extends BaseBuildStep<
	{ readonly unbuild?: boolean; readonly unbuildCompositePreset?: boolean },
	{ readonly unbuild?: UnBuild | undefined }
> {
	private unbuild: boolean = false
	private unbuildCompositePreset: boolean = true

	applyOptions(
		options: ProjectOptions & this['_outputOptions'],
	): ProjectOptions & this['_outputOptions'] {
		const { unbuild, unbuildCompositePreset, ...rest } = options
		this.unbuild = unbuild ?? false
		this.unbuildCompositePreset = unbuildCompositePreset ?? true
		return super.applyOptions(rest)
	}

	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		if (this.unbuild) {
			const compileTask = project.tasks.tryFind('compile')!
			compileTask.reset(
				NodePackageUtils.command.exec(
					project.package.packageManager,
					'tsc',
					'--build',
					'--emitDeclarationOnly',
				),
			)
			project.tasks
				.tryFind('compile')!
				.exec(
					NodePackageUtils.command.exec(
						project.package.packageManager,
						'unbuild',
					),
					{ name: 'Unbuild' },
				)
			const unbuild = new UnBuild(project, {
				cjs: true,
				options: {
					name: project.name,
					declaration: true,
					clean: true,
					entries: ['./src/index'],
					sourcemap: true,
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
			if (this.unbuildCompositePreset) {
				project.addDevDeps('@arroyodev-llc/utils.unbuild-composite-preset')
				unbuild.file.addImport({
					moduleSpecifier: '@arroyodev-llc/utils.unbuild-composite-preset',
					namedImports: ['compositePreset'],
				})
				unbuild.file.addConfig({
					preset: (writer) => writer.write('compositePreset()'),
				})
			}
			return {
				unbuild: { writable: false, value: unbuild },
			} as TypedPropertyDescriptorMap<this['_output']>
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
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		const lintConfig = new LintConfig(project, this.options).setEslintExec(
			'eslint --cache',
		)
		return {
			lintConfig: { writable: false, value: lintConfig },
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

export class TypescriptReleasePleaseBuilder extends BaseBuildStep<{}, {}> {
	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
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
					'0.0.0',
				)
			}
		}
		return super.applyProject(project)
	}
}
