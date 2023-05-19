import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import {
	ReleasePlease,
	ReleaseType,
} from '@arroyodev-llc/projen.component.release-please'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import { Vue } from '@arroyodev-llc/projen.component.vue'
import { type MonorepoProject } from '@arroyodev-llc/projen.project.nx-monorepo'
import { ProjectName } from '@arroyodev-llc/utils.projen'
import { NodePackageUtils } from '@aws-prototyping-sdk/nx-monorepo'
import { cdk, javascript, typescript } from 'projen'
import type { ProjenProjectOptions } from './projen-project-options'
import type { TypeScriptProjectOptions } from './typescript-project-options'

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

export class ProjenProject extends cdk.JsiiProject {
	public readonly projectName: ProjectName

	constructor(options: ProjenProjectOptions) {
		// TODO: jsii does not approve of <scope>/a.b.c type names
		const { name, ...rest } = options
		const projectName = new ProjectName(name)
		const {
			authorUrl,
			projenDevDependency,
			entrypoint,
			entrypointTypes,
			libdir,
			...defaults
		} = projectDefaults
		super({
			...defaults,
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			jsiiVersion: '^5',
			deps: ['projen'],
			peerDeps: ['projen'],
			prettier: true,
			...rest,
		})
		this.projectName = projectName
		new LintConfig(this)
		new PnpmWorkspace(this)
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
		const { name, workspaceDeps, tsconfigBase, tsconfig, ...rest } = options
		const projectName = new ProjectName(name)
		super({
			...projectDefaults,
			name: projectName.name,
			outdir: projectName.outDir,
			packageName: projectName.packageName,
			release: true,
			authorName: 'arroyoDev-LLC',
			prettier: true,
			tsconfig,
			projenCommand: NodePackageUtils.command.exec(
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
				...(tsconfig?.compilerOptions ?? {}),
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

		this.applyLintConfig().applyBundler().applyGithub()
	}

	protected applyBundler(): this {
		new UnBuild(this, {
			cjs: true,
			options: {
				name: this.projectName.packageName,
				declaration: true,
				clean: true,
				entries: ['./src/index'],
				rollup: {
					emitCJS: true,
				},
			},
		})
		return this
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

	protected applyLintConfig(): this {
		LintConfig.of(this)!.setEslintExec('eslint --cache')
		return this
	}

	protected applyGithub(): this {
		let releasePlease =
			ReleasePlease.of(this.parent ?? this) ?? new ReleasePlease(this)
		releasePlease.addProject(this, { releaseType: ReleaseType.NODE })
		const version = releasePlease.packages.get(this.name)
		if (version) {
			this.package.addVersion(version)
		} else {
			releasePlease.addProject(this, { releaseType: ReleaseType.NODE }, '0.0.0')
		}
		return this
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
		this.package.addField('sideEffects', true)
		new Vue(this)
	}

	// protected applyBundler(): this {
	// 	new Vite(this, {
	// 		build: {
	// 			optimizeDeps: {
	// 				include: ['vue'],
	// 			},
	// 			build: {
	// 				emptyOutDir: true,
	// 				lib: {
	// 					entry: './src/index.ts',
	// 					name: this.package.packageName
	// 				},
	// 			},
	// 		},
	// 	})
	// 	return this
	// }
}
