// ~~ Generated by projen. To modify, edit .projenrc.js and run "pnpm exec projen".

import { defineProject, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
export default mergeConfig(
	viteConfig,
	defineProject({
		test: {
			name: 'vue.ui.button',
			include: ['test/**/*.spec.ts'],
			environment: 'happy-dom',
		},
	}),
)
