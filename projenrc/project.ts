import path from 'node:path'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
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
			...rest,
		})
		this.projectName = projectName

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
		new UnBuild(this)
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
		dependency.forEach((dep) => {
			const depName = typeof dep === 'string' ? dep : dep.package.packageName
			this.addDeps(`${depName}@workspace:*`)
			if (dep instanceof TypescriptProject) {
				const tsPath = cwdRelativePath(
					this.outdir,
					path.join(path.join(dep.outdir, dep.srcdir), 'index')
				)
				const depNamePath = depName.replaceAll('.', '\\.')
				this.tsconfig.file.addOverride(`compilerOptions.paths.${depNamePath}`, [
					tsPath,
				])
			}
		})
	}
}

export class ProjenComponentProject extends TypescriptProject {
	constructor(options: TypeScriptProjectOptions) {
		super(options)
		this.addPeerDeps('projen')
	}
}
