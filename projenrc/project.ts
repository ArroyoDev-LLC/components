import { cdk, javascript, typescript } from 'projen'
import LintConfig from './lint-config'
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
	author: 'arroyoDev-LLC',
	authorOrganization: true,
	repositoryUrl: 'https://github.com/arroyodev-llc/components',
	projenrcTs: true,
} satisfies ProjenProjectOptions

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
	public readonly projectName: ProjectName
	public readonly tsconfig: javascript.TypescriptConfig
	public readonly tsconfigDev: javascript.TypescriptConfig

	constructor(options: TypeScriptProjectOptions) {
		const { name, ...rest } = options
		const projectName = new ProjectName(name)
		super({
			...projectDefaults,
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			release: true,
			authorName: 'arroyoDev-LLC',
			prettier: true,
			...rest,
		})
		this.projectName = projectName

		const parent = this.parent!
		const parentEsmTsconfig =
			parent.tryFindFile('tsconfig.esm.json')!.absolutePath

		const tsconfigPaths = this.copyTsConfigPaths(super.tsconfig, {
			include: ['src/*.ts', 'src/**/*.ts'],
		})
		const devTsconfigPaths = this.copyTsConfigPaths(super.tsconfigDev, {
			include: [...tsconfigPaths.include, '*.ts', '**/*.ts'],
			exclude: ['node_modules'],
		})

		this.tryRemoveFile('tsconfig.json')
		this.tsconfig = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.json',
			...tsconfigPaths,
			compilerOptions: {
				rootDir: '.',
				outDir: 'dist',
			},
			extends: javascript.TypescriptConfigExtends.fromPaths([
				parentEsmTsconfig,
			]),
		})

		this.tryRemoveFile('tsconfig.dev.json')
		this.tsconfigDev = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.dev.json',
			...devTsconfigPaths,
			compilerOptions: {
				rootDir: '.',
				outDir: 'dist',
			},
			extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([
				this.tsconfig,
			]),
		})

		new LintConfig(this)
	}

	protected copyTsConfigPaths(
		config?: javascript.TypescriptConfig,
		paths?: { include?: string[]; exclude?: string[] }
	) {
		const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr))
		const uniqMerge = <T>(arrA: T[], arrB: T[]): T[] =>
			uniq([...arrA.slice(), ...arrB.slice()])
		return {
			include: uniqMerge((config?.include ?? []).slice(), paths?.include ?? []),
			exclude: uniqMerge((config?.exclude ?? []).slice(), paths?.exclude ?? []),
		}
	}
}
