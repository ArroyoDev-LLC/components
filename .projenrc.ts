import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { Vitest } from '@arroyodev-llc/projen.component.vitest'
import { TypescriptProject } from '@arroyodev-llc/projen.project.typescript'
import { VueComponentProject } from '@arroyodev-llc/projen.project.vue-component'
import { LogLevel } from 'projen'
import { ComponentsMonorepo } from './projenrc/monorepo'
import {
	NxMonorepoProjectOptionsBuilder,
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'
import { ProjenComponentProject } from './projenrc/project'

const monorepo = new ComponentsMonorepo({
	name: 'components',
	devContainer: true,
	docgen: true,
	renovatebot: true,
	gitignore: ['/.idea', '.idea'],
	logging: {
		level: LogLevel.DEBUG,
		usePrefix: true,
	},
	devDeps: [
		'@aws-prototyping-sdk/nx-monorepo',
		'vite',
		'@vitejs/plugin-vue',
		'unbuild',
		'vitest',
		'rollup-plugin-vue',
		'tsx',
		'@types/prettier',
		'fs-extra',
		'@types/fs-extra',
		'@mrgrain/jsii-struct-builder',
		'@jsii/spec',
		'ts-morph',
		'@sindresorhus/is',
		'pathe',
	],
})

const utilsProjen = TypescriptProject.fromParent(monorepo, {
	name: 'utils.projen',
	deps: ['ts-morph', '@sindresorhus/is', 'type-fest', 'projen'],
})

const lintingComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.linting',
	workspaceDeps: [utilsProjen],
})

const tsSourceComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.typescript-source-file',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen, lintingComponent],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo'],
})

const pnpmWorkspaceComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.pnpm-workspace',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen],
})

const unbuildComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.unbuild',
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo', 'unbuild'],
})

const viteComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vite',
	workspaceDeps: [utilsProjen, tsSourceComponent, lintingComponent],
	deps: ['ts-morph', 'vite', '@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
})

const vitestComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vitest',
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', 'vitest'],
})

const toolVersionsComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.tool-versions',
})

const vueComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vue',
	workspaceDeps: [
		utilsProjen,
		lintingComponent,
		unbuildComponent,
		viteComponent,
		vitestComponent,
		tsSourceComponent,
	],
	deps: ['ts-morph'],
})

const releasePleaseComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.release-please',
	workspaceDeps: [utilsProjen],
})

const tsconfigContainerComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.tsconfig-container',
})

const tailwindComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.tailwind',
	deps: ['ts-morph', 'tailwindcss'],
	workspaceDeps: [utilsProjen, tsSourceComponent],
})
new Vitest(tailwindComponent)

const nxMonorepoProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.nx-monorepo',
	workspaceDeps: [
		utilsProjen,
		lintingComponent,
		pnpmWorkspaceComponent,
		tsconfigContainerComponent,
	],
	deps: ['@mrgrain/jsii-struct-builder', '@aws-prototyping-sdk/nx-monorepo'],
	peerDeps: ['projen'],
})
LintConfig.of(nxMonorepoProject)!.eslint.addIgnorePattern(
	'src/nx-monorepo-project-options.ts'
)

const typescriptProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.typescript',
	deps: ['@aws-prototyping-sdk/nx-monorepo'],
	workspaceDeps: [
		utilsProjen,
		lintingComponent,
		unbuildComponent,
		pnpmWorkspaceComponent,
		releasePleaseComponent,
		nxMonorepoProject,
	],
})
LintConfig.of(typescriptProject)!.eslint.addIgnorePattern(
	'src/typescript-project-options.ts'
)

const vueComponentProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.vue-component',
	workspaceDeps: [typescriptProject, vueComponent, viteComponent],
})

new ProjenProjectOptionsBuilder(monorepo)
new TypeScriptProjectOptionsBuilder(monorepo)
new NxMonorepoProjectOptionsBuilder(monorepo)

monorepo.addWorkspaceDeps(
	utilsProjen,
	lintingComponent,
	unbuildComponent,
	tsSourceComponent,
	viteComponent,
	vitestComponent,
	vueComponent,
	pnpmWorkspaceComponent,
	releasePleaseComponent,
	toolVersionsComponent,
	nxMonorepoProject,
	typescriptProject,
	vueComponentProject
)

// Vue Components

const text = VueComponentProject.fromParent(monorepo, {
	name: 'vue.ui.text',
	release: true,
})
LintConfig.of(text)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

const button = VueComponentProject.fromParent(monorepo, {
	name: 'vue.ui.button',
	workspaceDeps: [text],
	deps: ['primevue'],
})
LintConfig.of(button)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

monorepo.synth()
