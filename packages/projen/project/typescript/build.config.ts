// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	name: '@arroyodev-llc/projen.project.typescript',
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
})
