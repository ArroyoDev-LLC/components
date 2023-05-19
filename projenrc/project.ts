import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import { Vue } from '@arroyodev-llc/projen.component.vue'
import { TypescriptProject, type TypeScriptProjectOptions } from '@arroyodev-llc/projen.project.typescript'
import { ProjectName } from '@arroyodev-llc/utils.projen'
import { cdk, javascript } from 'projen'
import type { ProjenProjectOptions } from './projen-project-options'

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
