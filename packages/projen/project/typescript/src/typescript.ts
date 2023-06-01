import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import {
	ReleasePlease,
	ReleaseType,
} from '@arroyodev-llc/projen.component.release-please'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import {
	MonorepoProject,
	TSConfig,
} from '@arroyodev-llc/projen.project.nx-monorepo'
import { ProjectName } from '@arroyodev-llc/utils.projen'
import { NodePackageUtils } from '@aws-prototyping-sdk/nx-monorepo'
import { type Component, javascript, LogLevel, typescript } from 'projen'
import { deepMerge } from 'projen/lib/util'
import type { TypeScriptProjectOptions } from './typescript-project-options'

export const CONFIG_DEFAULTS = {
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

		const tsconfigPaths = this.copyTsConfigFiles(super.tsconfig, {
			include: ['src/*.ts', 'src/**/*.ts'],
		})
		const devTsconfigPaths = this.copyTsConfigFiles(super.tsconfigDev, {
			include: [...tsconfigPaths.include, '*.ts', '**/*.ts'],
			exclude: ['node_modules'],
		})

		this.tryRemoveFile('tsconfig.json')
		this.tsconfig = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.json',
			...tsconfigPaths,
			compilerOptions: {
				outDir: 'dist',
				...(tsconfig?.compilerOptions ?? {}),
			},
			extends: tsconfigBase,
		} as unknown as javascript.TypescriptConfigOptions)

		this.tryRemoveFile('tsconfig.dev.json')
		this.tsconfigDev = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.dev.json',
			...devTsconfigPaths,
			compilerOptions: {
				outDir: 'dist',
			},
			extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([
				this.tsconfig,
			]),
		})

		this.addWorkspaceDeps(...(workspaceDeps ?? []))

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

	copyTsConfigFiles(
		typescriptConfig?: javascript.TypescriptConfig,
		paths?: { include?: string[]; exclude?: string[] }
	): { include: string[]; exclude: string[] } {
		const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr))
		const uniqMerge = <T>(arrA: T[], arrB: T[]): T[] =>
			uniq([...arrA.slice(), ...arrB.slice()])
		return {
			include: uniqMerge(
				(typescriptConfig?.include ?? []).slice(),
				paths?.include ?? []
			),
			exclude: uniqMerge(
				(typescriptConfig?.exclude ?? []).slice(),
				paths?.exclude ?? []
			),
		}
	}

	addWorkspaceDeps(...dependency: (javascript.NodeProject | string)[]) {
		return PnpmWorkspace.of(this)!.addWorkspaceDeps(...dependency)
	}
}
