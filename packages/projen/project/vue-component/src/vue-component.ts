import { Vite } from '@arroyodev-llc/projen.component.vite'
import { Vue } from '@arroyodev-llc/projen.component.vue'
import {
	TypescriptProject,
	type TypeScriptProjectOptions,
} from '@arroyodev-llc/projen.project.typescript'

export class VueComponentProject extends TypescriptProject {
	public readonly vue: Vue

	constructor(options: TypeScriptProjectOptions) {
		super({
			release: true,
			...options,
		})
		this.vue = new Vue(this)
	}

	protected applyPackage(): this {
		super.applyPackage()
		this.package.addField('sideEffects', true)
		this.package.addField('module', 'dist/index.js')
		this.package.addField('main', 'dist/index.cjs')
		this.package.addField('exports', {
			'.': {
				import: 'dist/index.js',
				types: 'dist/index.dts',
				require: 'dist/index.cjs',
			},
		})
		return this
	}

	protected applyBundler(): this {
		new Vite(this)
			.addPlugin({
				name: 'tsconfigPaths',
				moduleImport: {
					moduleSpecifier: 'vite-tsconfig-paths',
					defaultImport: 'tsconfigPaths',
				},
			})
			.addPlugin({
				name: 'dts',
				options: {
					entryRoot: 'src',
				},
				moduleImport: {
					moduleSpecifier: 'vite-plugin-dts',
					defaultImport: 'dts',
				},
			})
			.addBuildConfig({
				build: {
					lib: {
						entry: 'src/index.ts',
						fileName: 'index',
						name: this.projectName.packageName,
						formats: ['es', 'cjs'],
					},
					rollupOptions: {
						external: ['vue', '@vue/runtime-dom'],
					},
				},
			})
		return this
	}
}
