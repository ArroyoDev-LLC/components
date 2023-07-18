import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { Vitest } from '@arroyodev-llc/projen.component.vitest'
import {
	TypescriptProject,
	TypescriptBaseBuilder,
} from '@arroyodev-llc/projen.project.typescript'
import { VueComponentProject } from '@arroyodev-llc/projen.project.vue-component'
import { builders } from '@arroyodev-llc/utils.projen-builder'
import { DependencyType, LogLevel, type Project } from 'projen'
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
	pnpmVersion: '8.6.2',
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

const TypescriptProjectBuilder = TypescriptBaseBuilder.add(
	new builders.DefaultOptionsBuilder<{
		parent?: typeof monorepo
		defaultReleaseBranch?: string
	}>({
		parent: monorepo,
	})
)
	.add(new builders.NameSchemeBuilder({ scope: '@arroyodev-llc' }))
	.add(
		new builders.OptionsPropertyBuilder<
			(typeof TypescriptBaseBuilder)['__optionsType']
		>()
	)

/**
 * Utility Projects
 */
const utilsFs = TypescriptProject.fromParent(monorepo, {
	name: 'utils.fs',
	deps: ['fs-extra', 'pathe'],
	devDeps: ['@types/fs-extra'],
})
new Vitest(utilsFs)

const utilsTsAst = TypescriptProject.fromParent(monorepo, {
	name: 'utils.ts-ast',
	deps: [
		'ts-morph',
		'@sindresorhus/is',
		'type-fest',
		'reflect-metadata',
		'projen',
	],
	workspaceDeps: [utilsFs],
	tsconfig: {
		compilerOptions: {
			types: ['reflect-metadata'],
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
		},
	},
})
new Vitest(utilsTsAst)

const utilsProjen = TypescriptProject.fromParent(monorepo, {
	name: 'utils.projen',
	deps: ['@sindresorhus/is', 'type-fest', 'projen', 'defu'],
	workspaceDeps: [utilsFs],
})
new Vitest(utilsProjen)

const utilsProjenBuilder = TypescriptProject.fromParent(monorepo, {
	name: 'utils.projen-builder',
	workspaceDeps: [utilsProjen],
	deps: ['projen', 'type-fest'],
})
new Vitest(utilsProjenBuilder)

/**
 * Projen Components
 */
const lintingComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.linting',
	deps: ['p-queue'],
	workspaceDeps: [utilsProjen],
})

const gitHooksComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.git-hooks',
	peerDeps: ['lint-staged', 'simple-git-hooks'],
})

const tsSourceComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.typescript-source-file',
	workspaceDeps: [utilsProjen, lintingComponent, utilsFs, utilsTsAst],
	peerDeps: ['@aws-prototyping-sdk/nx-monorepo'],
	deps: ['ts-morph'],
})

const pnpmWorkspaceComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.pnpm-workspace',
	workspaceDeps: [utilsProjen],
})

const unbuildComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.unbuild',
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
	peerDeps: ['@aws-prototyping-sdk/nx-monorepo'],
	deps: ['ts-morph', 'unbuild'],
})

const viteComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vite',
	workspaceDeps: [utilsProjen, tsSourceComponent, lintingComponent, utilsTsAst],
	deps: ['ts-morph', 'vite', '@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
})
new Vitest(viteComponent)

const vitestComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vitest',
	workspaceDeps: [utilsProjen, tsSourceComponent, viteComponent, utilsTsAst],
	deps: ['ts-morph', 'vitest'],
})

const toolVersionsComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.tool-versions',
})

const dirEnvComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.dir-env',
})
new Vitest(dirEnvComponent)

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
	workspaceDeps: [utilsProjen],
})

const tailwindComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.tailwind',
	deps: ['ts-morph', 'tailwindcss'],
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
})
new Vitest(tailwindComponent)

const postcssComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.postcss',
	deps: ['ts-morph', 'postcss-load-config'],
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
})
new Vitest(postcssComponent)

/**
 * Projen Projects
 */
const nxMonorepoProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.nx-monorepo',
	workspaceDeps: [
		utilsProjen,
		lintingComponent,
		pnpmWorkspaceComponent,
		tsconfigContainerComponent,
	],
	deps: ['@mrgrain/jsii-struct-builder'],
	peerDeps: ['projen', '@aws-prototyping-sdk/nx-monorepo'],
})
LintConfig.of(nxMonorepoProject)!.eslint.addIgnorePattern(
	'src/nx-monorepo-project-options.ts'
)

const typescriptProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.typescript',
	peerDeps: ['@aws-prototyping-sdk/nx-monorepo'],
	workspaceDeps: [
		utilsProjen,
		utilsProjenBuilder,
		lintingComponent,
		unbuildComponent,
		pnpmWorkspaceComponent,
		releasePleaseComponent,
		tsconfigContainerComponent,
		nxMonorepoProject,
	],
})
typescriptProject.lintConfig.eslint.addIgnorePattern(
	'src/typescript-project-options.ts'
)
typescriptProject.lintConfig.eslint.addIgnorePattern(
	'src/typescript-config-options.ts'
)
typescriptProject.lintConfig.eslint.addIgnorePattern(
	'src/typescript-compiler-options.ts'
)

const vueComponentProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.vue-component',
	workspaceDeps: [typescriptProject, vueComponent, viteComponent],
})

/**
 * JSII Structs
 */
new ProjenProjectOptionsBuilder(monorepo)
new TypeScriptProjectOptionsBuilder(monorepo)
new NxMonorepoProjectOptionsBuilder(monorepo)

/**
 * Monorepo dependencies.
 */
monorepo.addWorkspaceDeps(
	{ depType: DependencyType.DEVENV, addTsPath: true },
	utilsProjen,
	utilsProjenBuilder,
	lintingComponent,
	gitHooksComponent,
	unbuildComponent,
	tsSourceComponent,
	viteComponent,
	vitestComponent,
	vueComponent,
	pnpmWorkspaceComponent,
	releasePleaseComponent,
	toolVersionsComponent,
	dirEnvComponent,
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
