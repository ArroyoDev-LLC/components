import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import {
	Vitest,
	VitestConfigType,
} from '@arroyodev-llc/projen.component.vitest'
import { Vue } from '@arroyodev-llc/projen.component.vue'
import { findComponent } from '@arroyodev-llc/utils.projen'
import nx_monorepo, {
	buildExecutableCommand,
} from '@aws-prototyping-sdk/nx-monorepo'
import { cdk, type github, javascript, JsonFile, typescript } from 'projen'
import { TypeScriptModuleResolution } from 'projen/lib/javascript'
import type { NxMonorepoProjectOptions } from './nx-monorepo-project-options'
import type { ProjenProjectOptions } from './projen-project-options'
import type { TypeScriptProjectOptions } from './typescript-project-options'

export class ProjectName {
	constructor(readonly name: string) {}

	get path(): string {
		return this.name.split('.').join('/')
	}

	get outDir(): string {
		return `packages/${this.path}`
	}

	get packageName(): string {
		return `@arroyodev-llc/${this.name}`
	}
}

const projectDefaults = {
	name: '',
	defaultReleaseBranch: 'main',
	packageManager: javascript.NodePackageManager.PNPM,
	pnpmVersion: '8',
	npmAccess: javascript.NpmAccess.PUBLIC,
	release: false,
	releaseToNpm: true,
	jest: false,
	projenDevDependency: false,
	entrypoint: 'dist/index.mjs',
	entrypointTypes: 'dist/index.d.ts',
	libdir: 'dist',
	typescriptVersion: '^5',
	authorAddress: 'support@arroyodev.com',
	authorEmail: 'support@arroyodev.com',
	authorUrl: 'https://arroyodev.com',
	author: 'arroyoDev-LLC',
	authorOrganization: true,
	repositoryUrl: 'https://github.com/arroyodev-llc/components',
	projenrcTs: true,
} satisfies ProjenProjectOptions

export class MonorepoProject extends nx_monorepo.NxMonorepoProject {
	public readonly esmBundledTsconfigExtends: javascript.TypescriptConfigExtends

	constructor(options: NxMonorepoProjectOptions) {
		const { workspaceDeps, tsconfigBase, tsconfig, ...rest } = options
		super({
			...projectDefaults,
			releaseToNpm: false,
			projenDevDependency: true,
			tsconfig,
			...rest,
		})
		const pnpmWorkspace = new PnpmWorkspace(this)
		pnpmWorkspace.addWorkspaceDeps(...(workspaceDeps ?? []))
		new LintConfig(this)
		this.gitignore.exclude('.idea', '.idea/**')
		this.addDevDeps('tsx')
		this.defaultTask!.reset('tsx .projenrc.ts')
		new JsonFile(this, '.ncurc.json', {
			readonly: true,
			marker: false,
			allowComments: false,
			obj: {
				reject: [],
			},
		})
		new Vitest(this, {
			configType: VitestConfigType.WORKSPACE,
			settings: {
				test: {
					threads: true,
				},
			},
		})
		this.esmBundledTsconfigExtends = this.buildEsmBundledTsConfig()
		this.applyNpmConfig(
			findComponent(this, javascript.NpmConfig) ??
				new javascript.NpmConfig(this)
		)
			.applyGithub(this.github!)
			.applyPackage(this.package)
		this.tsconfigDev!.addExtends(this.tsconfig!)
	}

	protected applyGithub(gh: github.GitHub): this {
		const build = gh.tryFindWorkflow('build')!
		return this.applyGithubBuildFlow(build)
	}

	protected applyGithubBuildFlow(workflow: github.GithubWorkflow): this {
		const buildJob = workflow.getJob('build')! as github.workflows.Job
		workflow.updateJob('build', {
			...buildJob,
			env: {
				...buildJob.env,
				NX_NON_NATIVE_HASHER: 'true',
				NX_BRANCH: '${{ github.event.number }}',
				NX_RUN_GROUP: '${{ github.run_id }}',
				NX_CLOUD_ACCESS_TOKEN: '${{ secrets.NX_CLOUD_ACCESS_TOKEN }}',
			},
		})
		return this
	}

	protected applyPackage(nodePackage: javascript.NodePackage): this {
		nodePackage.addField('type', 'module')
		this.addNxRunManyTask('stub', {
			skipCache: true,
			target: 'stub',
		})
		this.addScripts({
			postinstall: 'projen stub',
		})
		return this
	}

	protected applyNpmConfig(npmConfig: javascript.NpmConfig): this {
		// default '*' to highest resolution.
		npmConfig.addConfig('resolution-mode', 'highest')
		return this
	}

	protected buildEsmBundledTsConfig() {
		const base = this.buildExtendableTypeScriptConfig('tsconfig.base.json', {
			skipLibCheck: true,
			strict: true,
			strictNullChecks: true,
			resolveJsonModule: true,
			noImplicitThis: true,
			noUnusedLocals: true,
			noUnusedParameters: true,
			noFallthroughCasesInSwitch: true,
			forceConsistentCasingInFileNames: true,
		})
		base.file.addOverride('compilerOptions.useDefineForClassFields', true)
		const esm = this.buildExtendableTypeScriptConfig('tsconfig.esm.json', {
			module: 'ESNext',
			target: 'ES2022',
			lib: ['ES2022'],
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
		})
		const bundler = this.buildExtendableTypeScriptConfig(
			'tsconfig.bundler.json',
			{
				moduleResolution: TypeScriptModuleResolution.BUNDLER,
				allowImportingTsExtensions: true,
				allowArbitraryExtensions: true,
				resolveJsonModule: true,
				isolatedModules: true,
				verbatimModuleSyntax: true,
				noEmit: true,
				jsx: javascript.TypeScriptJsxMode.PRESERVE,
			}
		)
		return javascript.TypescriptConfigExtends.fromTypescriptConfigs([
			base,
			esm,
			bundler,
		])
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
		const config = new javascript.TypescriptConfig(this, {
			fileName,
			compilerOptions: options,
		})
		config.file.addDeletionOverride('include')
		config.file.addDeletionOverride('exclude')
		return config
	}

	addWorkspaceDeps(...dependency: (javascript.NodeProject | string)[]) {
		return PnpmWorkspace.of(this)!.addWorkspaceDeps(...dependency)
	}
}

export class ProjenProject extends cdk.JsiiProject {
	public readonly projectName: ProjectName

	constructor(options: ProjenProjectOptions) {
		const { name, ...rest } = options
		const projectName = new ProjectName(name)
		super({
			...projectDefaults,
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			jsiiVersion: '^5',
			projenDevDependency: true,
			prettier: true,
			...rest,
		})
		this.projectName = projectName
		new LintConfig(this)
	}
}

export class TypescriptProject extends typescript.TypeScriptProject {
	static fromParent(
		monorepo: MonorepoProject,
		options: TypeScriptProjectOptions
	) {
		const { tsconfigBase, ...rest } = options
		return new this({
			parent: monorepo,
			tsconfigBase: tsconfigBase ?? monorepo.esmBundledTsconfigExtends,
			...rest,
		})
	}

	public readonly projectName: ProjectName
	public readonly tsconfig: javascript.TypescriptConfig
	public readonly tsconfigDev: javascript.TypescriptConfig

	constructor(options: TypeScriptProjectOptions) {
		const { name, workspaceDeps, tsconfigBase, ...rest } = options
		const projectName = new ProjectName(name)
		super({
			...projectDefaults,
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			release: true,
			authorName: 'arroyoDev-LLC',
			prettier: true,
			projenCommand: buildExecutableCommand(
				javascript.NodePackageManager.PNPM,
				'projen'
			),
			...rest,
		})
		this.projectName = projectName
		new PnpmWorkspace(this)

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
			},
			extends: tsconfigBase,
		})

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

		this.package.addField('type', 'module')
		this.package.addField('sideEffects', false)
		new LintConfig(this)
		new UnBuild(this, {
			options: { name: this.projectName.packageName, declaration: true },
		})
		this.compileTask.exec('unbuild')
	}

	protected copyTsConfigFiles(
		typescriptConfig?: javascript.TypescriptConfig,
		paths?: { include?: string[]; exclude?: string[] }
	) {
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

export class ProjenComponentProject extends TypescriptProject {
	constructor(options: TypeScriptProjectOptions) {
		super(options)
		this.addPeerDeps('projen')
	}
}

export class VueComponentProject extends TypescriptProject {
	constructor(options: TypeScriptProjectOptions) {
		super({
			release: true,
			...options,
		})
		new Vue(this)
	}
}
