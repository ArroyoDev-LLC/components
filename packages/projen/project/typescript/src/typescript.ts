import { LintConfig } from '@arroyodev-llc/projen.component.linting'
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
	builders as stdBuilders,
	ProjectBuilder,
} from '@arroyodev-llc/utils.projen-builder'
import { NodePackageUtils } from '@aws-prototyping-sdk/nx-monorepo'
import {
	type Component,
	DependencyType,
	javascript,
	LogLevel,
	typescript,
} from 'projen'
import { deepMerge } from 'projen/lib/util'
import * as tsBuilders from './builders'
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
		'projen',
	),
	projenrcTs: true,
	prettier: true,
	unbuild: true,
} satisfies Omit<TypeScriptProjectOptions, 'name'>

/**
 * Base {@link typescript.TypeScriptProject} builder with most commonly used steps.
 */
export const TypescriptBaseBuilder = new ProjectBuilder(
	typescript.TypeScriptProject,
)
	.add(new stdBuilders.DefaultOptionsBuilder(CONFIG_DEFAULTS))
	.add(
		new tsBuilders.TypescriptConfigBuilder({
			extendsDefault: (container) =>
				container.buildExtends(
					TSConfig.BASE,
					TSConfig.ESM,
					TSConfig.BUNDLER,
					TSConfig.COMPOSITE,
				),
		}),
	)
	.add(new tsBuilders.TypescriptLintingBuilder({ useTypeInformation: true }))
	.add(new tsBuilders.TypescriptESMManifestBuilder())
	.add(new tsBuilders.TypescriptBundlerBuilder())
	.add(new tsBuilders.TypescriptReleasePleaseBuilder())

/**
 * @deprecated Use `TypescriptBaseBuilder` instead
 */
export class TypescriptProject extends typescript.TypeScriptProject {
	/**
	 * Create new package under monorepo parent.
	 * @param monorepo Parent monorepo project.
	 * @param options Project options.
	 */
	static fromParent(
		monorepo: MonorepoProject,
		options: TypeScriptProjectOptions,
	) {
		const { tsconfigBase, ...rest } = options
		return new this({
			parent: monorepo,
			tsconfigBase:
				tsconfigBase ??
				monorepo.tsconfigContainer.buildExtends(
					TSConfig.BASE,
					TSConfig.ESM,
					TSConfig.BUNDLER,
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
			true,
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
			...(workspaceDeps ?? []),
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
