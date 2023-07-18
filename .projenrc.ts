import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { Vitest } from '@arroyodev-llc/projen.component.vitest'
import { TypescriptBaseBuilder } from '@arroyodev-llc/projen.project.typescript'
import { VueComponentProject } from '@arroyodev-llc/projen.project.vue-component'
import { builders } from '@arroyodev-llc/utils.projen-builder'
import { DependencyType, LogLevel } from 'projen'
import { ComponentsMonorepo } from './projenrc/monorepo'
import {
	NxMonorepoProjectOptionsBuilder,
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'

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

const TypescriptOptionsBuilder = new builders.OptionsPropertyBuilder<
	(typeof TypescriptBaseBuilder)['__optionsType']
>()

const BaseTypescriptProjectBuilder = TypescriptBaseBuilder.add(
	new builders.DefaultOptionsBuilder<{
		parent?: typeof monorepo
		defaultReleaseBranch?: string
	}>({
		parent: monorepo,
	})
).add(new builders.NameSchemeBuilder({ scope: '@arroyodev-llc' }))

const TypescriptProjectBuilder = BaseTypescriptProjectBuilder.add(
	TypescriptOptionsBuilder
)
const ProjenComponentProjectBuilder = BaseTypescriptProjectBuilder.add(
	new builders.DefaultOptionsBuilder({
		peerDeps: ['projen'],
	})
).add(TypescriptOptionsBuilder)

/**
 * Utility Projects
 */
const utilsFs = TypescriptProjectBuilder.build({
	name: 'utils.fs',
	deps: ['fs-extra', 'pathe'],
	devDeps: ['@types/fs-extra'],
})
new Vitest(utilsFs)

const utilsTsAst = TypescriptProjectBuilder.build({
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
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
		},
	},
})
utilsTsAst.tsconfig.file.addOverride('compilerOptions.types', [
	'reflect-metadata',
])
new Vitest(utilsTsAst)

const utilsProjen = TypescriptProjectBuilder.build({
	name: 'utils.projen',
	deps: ['@sindresorhus/is', 'type-fest', 'projen', 'defu'],
	workspaceDeps: [utilsFs],
})
new Vitest(utilsProjen)

const utilsProjenBuilder = TypescriptProjectBuilder.build({
	name: 'utils.projen-builder',
	workspaceDeps: [utilsProjen],
	deps: ['projen', 'type-fest'],
})
new Vitest(utilsProjenBuilder)

/**
 * Projen Components
 */
const lintingComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.linting',
	deps: ['p-queue'],
	workspaceDeps: [utilsProjen],
})

const gitHooksComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.git-hooks',
	peerDeps: ['lint-staged', 'simple-git-hooks'],
})

const tsSourceComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.typescript-source-file',
	workspaceDeps: [utilsProjen, lintingComponent, utilsFs, utilsTsAst],
	peerDeps: ['@aws-prototyping-sdk/nx-monorepo'],
	deps: ['ts-morph'],
})

const pnpmWorkspaceComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.pnpm-workspace',
	workspaceDeps: [utilsProjen],
})

const unbuildComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.unbuild',
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
	peerDeps: ['@aws-prototyping-sdk/nx-monorepo'],
	deps: ['ts-morph', 'unbuild'],
})

const viteComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.vite',
	workspaceDeps: [utilsProjen, tsSourceComponent, lintingComponent, utilsTsAst],
	deps: ['ts-morph', 'vite', '@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
})
new Vitest(viteComponent)

const vitestComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.vitest',
	workspaceDeps: [utilsProjen, tsSourceComponent, viteComponent, utilsTsAst],
	deps: ['ts-morph', 'vitest'],
})

const toolVersionsComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.tool-versions',
})

const dirEnvComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.dir-env',
})
new Vitest(dirEnvComponent)

const vueComponent = ProjenComponentProjectBuilder.build({
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

const releasePleaseComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.release-please',
	workspaceDeps: [utilsProjen],
})

const tsconfigContainerComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.tsconfig-container',
	workspaceDeps: [utilsProjen],
})

const tailwindComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.tailwind',
	deps: ['ts-morph', 'tailwindcss'],
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
})
new Vitest(tailwindComponent)

const postcssComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.postcss',
	deps: ['ts-morph', 'postcss-load-config'],
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
})
new Vitest(postcssComponent)

/**
 * Projen Projects
 */
const nxMonorepoProject = ProjenComponentProjectBuilder.build({
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

const typescriptProject = ProjenComponentProjectBuilder.build({
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

const vueComponentProject = ProjenComponentProjectBuilder.build({
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
