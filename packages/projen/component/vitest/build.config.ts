// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

import { defineBuildConfig, type BuildConfig } from 'unbuild'

const config: BuildConfig = {
	name: '@arroyodev-llc/projen.component.vitest',
	declaration: true,
	clean: true,
	entries: ['./src/index'],
	rollup: { emitCJS: true },
}
export default defineBuildConfig(config)
