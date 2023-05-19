import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { github, LogLevel } from 'projen'
import {
	TypescriptConfigExtends,
	TypeScriptModuleResolution,
} from 'projen/lib/javascript'
import { ComponentsMonorepo } from './projenrc/monorepo'
import {
	NxMonorepoProjectOptionsBuilder,
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'
import {
	ProjenComponentProject,
	TypescriptProject,
	VueComponentProject,
} from './projenrc/project'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

const monorepo = new ComponentsMonorepo({
	name: 'components',
	authorName: 'arroyoDev',
	devContainer: true,
	docgen: true,
	github: true,
	githubOptions: {
		mergify: true,
		workflows: true,
		projenCredentials: arroyoBot,
		pullRequestLintOptions: {
			semanticTitleOptions: {
				types: [
					'feat',
					'fix',
					'perf',
					'revert',
					'docs',
					'style',
					'chore',
					'refactor',
					'test',
					'build',
					'ci',
				],
			},
		},
	},
	autoApproveUpgrades: true,
	autoApproveOptions: {
		allowedUsernames: ['github-actions[bot]', 'arroyobot[bot]'],
	},
	prettier: true,
	projenrcTs: true,
	renovatebot: true,
	gitignore: ['/.idea', '.idea'],
	logging: {
		level: LogLevel.DEBUG,
		usePrefix: true,
	},
	tsconfig: {
		exclude: ['packages/**/*'],
		include: ['.projenrc.ts', 'projenrc', './*.ts'],
		extends: TypescriptConfigExtends.fromPaths([
			'./tsconfig.base.json',
			'./tsconfig.esm.json',
		]),
		compilerOptions: {
			rootDir: '.',
			moduleResolution: TypeScriptModuleResolution.NODE,
			lib: ['ES2022'],
			module: 'ESNext',
			target: 'ES2022',
			allowSyntheticDefaultImports: true,
			allowArbitraryExtensions: true,
			allowImportingTsExtensions: true,
			skipLibCheck: true,
			emitDeclarationOnly: true,
			forceConsistentCasingInFileNames: true,
		},
	},
	devDeps: [
		'@aws-prototyping-sdk/nx-monorepo',
		'vite',
		'@vitejs/plugin-vue',
		'unbuild',
		'vitest',
		'rollup-plugin-vue',
		'tsx',
		'unbuild',
		'@types/prettier',
		'fs-extra',
		'@types/fs-extra',
		'@mrgrain/jsii-struct-builder',
		'@jsii/spec',
		'ts-morph',
		'@sindresorhus/is',
		'eslint_d',
		'pathe',
	],
})

const utilsProjen = TypescriptProject.fromParent(monorepo, {
	name: 'utils.projen',
	deps: ['ts-morph', '@sindresorhus/is', 'type-fest', 'projen'],
})

const tsSourceComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.typescript-source-file',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen],
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
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', 'vite', '@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
})

const vitestComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.vitest',
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', 'vitest'],
})

const lintingComponent = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.component.linting',
	workspaceDeps: [utilsProjen],
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

const nxMonorepoProject = ProjenComponentProject.fromParent(monorepo, {
	name: 'projen.project.nx-monorepo',
	workspaceDeps: [utilsProjen, lintingComponent, pnpmWorkspaceComponent],
	deps: ['@mrgrain/jsii-struct-builder', '@aws-prototyping-sdk/nx-monorepo'],
	peerDeps: ['projen'],
})
LintConfig.of(nxMonorepoProject)!.eslint.addIgnorePattern(
	'src/nx-monorepo-project-options.ts'
)

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
	nxMonorepoProject
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
