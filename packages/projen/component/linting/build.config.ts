// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

import { compositePreset } from '@arroyodev-llc/utils.unbuild-composite-preset'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	name: 'projen.component.linting',
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
	preset: compositePreset(),
})
