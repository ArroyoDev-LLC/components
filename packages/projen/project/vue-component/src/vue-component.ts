import { Vite } from '@arroyodev-llc/projen.component.vite'
import { Vue } from '@arroyodev-llc/projen.component.vue'
import { TypescriptBaseBuilder } from '@arroyodev-llc/projen.project.typescript'
import {
	BaseBuildStep,
	builders,
	type TypedPropertyDescriptorMap,
} from '@arroyodev-llc/utils.projen-builder'
import { type typescript } from 'projen'

export class VueComponentViteBuilder extends BaseBuildStep<
	{},
	{ readonly vite: Vite }
> {
	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		const vite = new Vite(project)
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
						name: project.package.packageName,
						formats: ['es', 'cjs'],
					},
					rollupOptions: {
						external: ['vue', '@vue/runtime-dom'],
					},
				},
			})
		return {
			vite: { writable: false, value: vite },
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

export class VueComponentManifestBuilder extends BaseBuildStep<
	object,
	{
		readonly vue: Vue
	}
> {
	applyProject(
		project: typescript.TypeScriptProject,
	): TypedPropertyDescriptorMap<this['_output']> {
		project.package.addField('sideEffects', true)
		project.package.addField('module', 'dist/index.js')
		project.package.addField('main', 'dist/index.cjs')
		project.package.addField('exports', {
			'.': {
				import: 'dist/index.js',
				types: 'dist/index.dts',
				require: 'dist/index.cjs',
			},
		})
		return {
			vue: { writable: false, value: new Vue(project) },
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

export const VueComponentBaseBuilder = TypescriptBaseBuilder.add(
	new builders.DefaultOptionsBuilder({ release: true, unbuild: false }),
	{ prepend: true },
)
	.add(new VueComponentViteBuilder())
	.add(new VueComponentManifestBuilder())
