import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import * as nx_monorepo from '@aws-prototyping-sdk/nx-monorepo'
import { github, javascript, JsonFile, LogLevel, release } from 'projen'
import { TypeScriptModuleResolution } from 'projen/lib/javascript'
import LintConfig from './projenrc/lint-config'
import {
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'
import { TypescriptProject } from './projenrc/project'
import { Vitest, VitestConfigType } from './projenrc/vitest'
import { VueComponent } from './projenrc/vue'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

const monorepo = new nx_monorepo.NxMonorepoProject({
	authorEmail: 'support@arroyodev.com',
	authorName: 'arroyoDev',
	authorOrganization: true,
	authorUrl: 'https://arroyodev.com',
	defaultReleaseBranch: 'main',
	devContainer: true,
	docgen: true,
	name: 'components',
	packageManager: javascript.NodePackageManager.PNPM,
	pnpmVersion: '8',
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
		compilerOptions: {
			rootDir: '.',
			module: 'ESNext',
			target: 'ES2022',
			lib: ['ES2022'],
			moduleResolution: TypeScriptModuleResolution.NODE,
			allowImportingTsExtensions: true,
			allowArbitraryExtensions: true,
			emitDeclarationOnly: true,
			forceConsistentCasingInFileNames: true,
			skipLibCheck: true,
			strict: true,
			strictNullChecks: true,
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
		'ts-morph',
		'@sindresorhus/is',
		'eslint_d',
		'pathe',
	],
})
const tsconfigEsm = new javascript.TypescriptConfig(monorepo, {
	fileName: 'tsconfig.esm.json',
	compilerOptions: {
		module: 'ESNext',
		target: 'ES2022',
		lib: ['ES2022'],
		moduleResolution: TypeScriptModuleResolution.NODE,
		forceConsistentCasingInFileNames: true,
		verbatimModuleSyntax: true,
		skipLibCheck: true,
		strict: true,
		strictNullChecks: true,
	},
})

new LintConfig(monorepo)

monorepo.gitignore.exclude('.idea', '.idea/**')
monorepo.defaultTask.reset('tsx .projenrc.ts')
monorepo.tsconfig.addInclude('**/*.ts')
monorepo.tsconfig.addInclude('projenrc/**.ts')
monorepo.tsconfigDev.addInclude('**/*.ts')
monorepo.tsconfigDev.file.addOverride('compilerOptions.rootDir', '.')

// workaround for:
// https://github.com/aws/aws-prototyping-sdk/issues/365
monorepo.package.addBin({
	'pdk@pnpm-link-bundled-transitive-deps':
		'./node_modules/@aws-prototyping-sdk/nx-monorepo/scripts/pnpm/link-bundled-transitive-deps.ts',
})

monorepo.package.addField('type', 'module')
monorepo.package.file.addOverride('pnpm.patchedDependencies', {
	'projen@0.71.7': 'patches/projen@0.71.7.patch',
})
// ensure projen is not updated until patch is merged.
new JsonFile(monorepo, '.ncurc.json', {
	readonly: true,
	marker: false,
	allowComments: false,
	obj: {
		reject: ['projen'],
	},
})

const gh = monorepo.github!
const buildFlow = gh.tryFindWorkflow('build')!
const buildJob = buildFlow.getJob('build')! as github.workflows.Job
buildFlow.updateJob('build', {
	...buildJob,
	env: {
		...buildJob.env,
		NX_NON_NATIVE_HASHER: 'true',
		NX_BRANCH: '${{ github.event.number }}',
		NX_RUN_GROUP: '${{ github.run_id }}',
		NX_CLOUD_ACCESS_TOKEN: '${{ secrets.NX_CLOUD_ACCESS_TOKEN }}',
	},
})

new Vitest(monorepo, {
	configType: VitestConfigType.WORKSPACE,
	settings: {
		test: {
			threads: true,
		},
	},
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
	deps: ['ts-morph'],
})
utilsProjen.tryRemoveFile('tsconfig.json')
const utilsTsconfig = new javascript.TypescriptConfig(utilsProjen, {
	fileName: 'tsconfig.json',
	extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([
		tsconfigEsm,
	]),
	include: ['src/**/*.ts', '**/*.ts'],
	exclude: ['node_modules'],
	compilerOptions: {
		rootDir: '.',
		outDir: 'dist',
	},
})
new UnBuild(utilsProjen)
utilsProjen.compileTask.reset('unbuild')

const tsSourceComponent = new TypescriptProject({
	name: 'projen.component.typescript-source-file',
	parent: monorepo,
	deps: [
		`${utilsProjen.package.packageName}@workspace:*`,
		'projen',
		'ts-morph',
		'@aws-prototyping-sdk/nx-monorepo',
	],
})
new UnBuild(tsSourceComponent)
tsSourceComponent.compileTask.reset('unbuild')

const unbuildComponent = new TypescriptProject({
	name: 'projen.component.unbuild',
	parent: monorepo,
	deps: [
		`${utilsProjen.package.packageName}@workspace:*`,
		`${tsSourceComponent.package.packageName}@workspace:*`,
		'unbuild',
		'projen',
		'ts-morph',
		'@aws-prototyping-sdk/nx-monorepo',
	],
})
new UnBuild(unbuildComponent)
unbuildComponent.compileTask.reset('unbuild')

new ProjenProjectOptionsBuilder(monorepo)
new TypeScriptProjectOptionsBuilder(monorepo)

monorepo.addDeps(`${unbuildComponent.package.packageName}@workspace:*`)
monorepo.addDeps(`${utilsProjen.package.packageName}@workspace:*`)

monorepo.synth()
