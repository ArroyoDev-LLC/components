import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { github, LogLevel, release } from 'projen'
import {
	TypescriptConfigExtends,
	TypeScriptModuleResolution,
} from 'projen/lib/javascript'
import {
	NxMonorepoProjectOptionsBuilder,
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'
import {
	MonorepoProject,
	ProjenComponentProject,
	TypescriptProject,
} from './projenrc/project'
import { VueComponent } from './projenrc/vue'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

const monorepo = new MonorepoProject({
	name: 'components',
	authorName: 'arroyoDev',
	devContainer: true,
	docgen: true,
	github: true,
	githubOptions: {
		mergify: true,
		workflows: true,
		projenCredentials: arroyoBot,
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
	nxConfig: {
		// public readonly token, is not secret.
		nxCloudReadOnlyAccessToken:
			'NTc0NTE5MGItNjY3Ni00YmQzLTg0YTUtNWFkMzc5ZWZiY2Y4fHJlYWQtb25seQ==',
	},
	tsconfig: {
		exclude: ['packages'],
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
	projenVersion: '0.71.7',
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

const text = new VueComponent({
	parent: monorepo,
	name: 'vue.ui.text',
	release: true,
	releaseToNpm: true,
})
LintConfig.of(text)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

const button = new VueComponent({
	parent: monorepo,
	name: 'vue.ui.button',
	deps: ['primevue', text.package.packageName],
})
LintConfig.of(button)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})
new release.Release(button, {
	githubRelease: true,
	task: button.tasks.tryFind('build')!,
	branch: 'main',
	versionFile: 'package.json',
	artifactsDirectory: button.artifactsDirectory,
})

const utilsProjen = new TypescriptProject({
	name: 'utils.projen',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	deps: ['ts-morph'],
})

const tsSourceComponent = new ProjenComponentProject({
	name: 'projen.component.typescript-source-file',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo'],
})

const pnpmWorkspaceComponent = new ProjenComponentProject({
	name: 'projen.component.pnpm-workspace',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen],
})

const unbuildComponent = new ProjenComponentProject({
	name: 'projen.component.unbuild',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo', 'unbuild'],
})

const vitestComponent = new ProjenComponentProject({
	name: 'projen.component.vitest',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', 'vitest'],
})

const lintingComponent = new ProjenComponentProject({
	name: 'projen.component.linting',
	parent: monorepo,
	tsconfigBase: monorepo.esmBundledTsconfigExtends,
	workspaceDeps: [utilsProjen],
})

new ProjenProjectOptionsBuilder(monorepo)
new TypeScriptProjectOptionsBuilder(monorepo)
new NxMonorepoProjectOptionsBuilder(monorepo)

monorepo.addWorkspaceDeps(
	utilsProjen,
	lintingComponent,
	unbuildComponent,
	tsSourceComponent,
	vitestComponent,
	pnpmWorkspaceComponent
)

monorepo.synth()
