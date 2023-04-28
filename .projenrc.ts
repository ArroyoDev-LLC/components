import path from 'node:path'
import {
	Vitest,
	VitestConfigType,
} from '@arroyodev-llc/projen.component.vitest'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
import * as nx_monorepo from '@aws-prototyping-sdk/nx-monorepo'
import { github, javascript, JsonFile, LogLevel, release } from 'projen'
import { TypeScriptModuleResolution } from 'projen/lib/javascript'
import LintConfig from './projenrc/lint-config'
import {
	NxMonorepoProjectOptionsBuilder,
	ProjenProjectOptionsBuilder,
	TypeScriptProjectOptionsBuilder,
} from './projenrc/option-builders'
import { ProjenComponentProject, TypescriptProject } from './projenrc/project'
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
		exclude: ['packages'],
		include: ['.projenrc.ts', 'projenrc', './*.ts'],
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
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
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
const npmConfig = new javascript.NpmConfig(monorepo)
// default '*' to highest resolution.
npmConfig.addConfig('resolution-mode', 'highest')
const tsconfigBase = new javascript.TypescriptConfig(monorepo, {
	fileName: 'tsconfig.base.json',
	compilerOptions: {
		skipLibCheck: true,
		strict: true,
		strictNullChecks: true,
		noUnusedLocals: true,
		noUnusedParameters: true,
		noFallthroughCasesInSwitch: true,
		forceConsistentCasingInFileNames: true,
	},
})
tsconfigBase.file.addOverride('compilerOptions.useDefineForClassFields', true)
tsconfigBase.file.addDeletionOverride('include')
tsconfigBase.file.addDeletionOverride('exclude')
const tsconfigEsm = new javascript.TypescriptConfig(monorepo, {
	fileName: 'tsconfig.esm.json',
	compilerOptions: {
		module: 'ESNext',
		target: 'ES2022',
		lib: ['ES2022'],
		allowSyntheticDefaultImports: true,
		esModuleInterop: true,
	},
})
tsconfigEsm.file.addDeletionOverride('include')
tsconfigEsm.file.addDeletionOverride('exclude')
const tsconfigBundler = new javascript.TypescriptConfig(monorepo, {
	fileName: 'tsconfig.bundler.json',
	compilerOptions: {
		moduleResolution: TypeScriptModuleResolution.BUNDLER,
		allowImportingTsExtensions: true,
		allowArbitraryExtensions: true,
		resolveJsonModule: true,
		isolatedModules: true,
		verbatimModuleSyntax: true,
		noEmit: true,
		jsx: javascript.TypeScriptJsxMode.PRESERVE,
	},
})
tsconfigBundler.file.addDeletionOverride('include')
tsconfigBundler.file.addDeletionOverride('exclude')

const tsconfigBundledEsmExtends =
	javascript.TypescriptConfigExtends.fromTypescriptConfigs([
		tsconfigBase,
		tsconfigEsm,
		tsconfigBundler,
	])

new LintConfig(monorepo)

monorepo.gitignore.exclude('.idea', '.idea/**')
monorepo.defaultTask.reset('tsx .projenrc.ts')
monorepo.tsconfig.addInclude('**/*.ts')
monorepo.tsconfig.addInclude('projenrc/**.ts')
monorepo.tsconfigDev.addInclude('**/*.ts')
monorepo.tsconfigDev.file.addOverride('compilerOptions.rootDir', '.')

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
	tsconfigBase: tsconfigBundledEsmExtends,
	deps: ['ts-morph'],
})

const tsSourceComponent = new ProjenComponentProject({
	name: 'projen.component.typescript-source-file',
	parent: monorepo,
	tsconfigBase: tsconfigBundledEsmExtends,
	workspaceDeps: [utilsProjen],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo'],
})

const unbuildComponent = new ProjenComponentProject({
	name: 'projen.component.unbuild',
	parent: monorepo,
	tsconfigBase: tsconfigBundledEsmExtends,
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', '@aws-prototyping-sdk/nx-monorepo', 'unbuild'],
})

const vitestComponent = new ProjenComponentProject({
	name: 'projen.component.vitest',
	parent: monorepo,
	tsconfigBase: tsconfigBundledEsmExtends,
	workspaceDeps: [utilsProjen, tsSourceComponent],
	deps: ['ts-morph', 'vitest'],
})

new ProjenProjectOptionsBuilder(monorepo)
new TypeScriptProjectOptionsBuilder(monorepo)
new NxMonorepoProjectOptionsBuilder(monorepo)

monorepo.addDeps(`${unbuildComponent.package.packageName}@workspace:*`)
monorepo.addDeps(`${utilsProjen.package.packageName}@workspace:*`)
monorepo.addDeps(`${tsSourceComponent.package.packageName}@workspace:*`)
monorepo.addDeps(`${vitestComponent.package.packageName}@workspace:*`)

monorepo.subProjects.forEach((project) => {
	if (!(project instanceof TypescriptProject)) return
	const relPath = cwdRelativePath(
		monorepo.outdir,
		path.join(project.outdir, project.srcdir, 'index')
	)
	const projName = project.package.packageName.replaceAll('.', '\\.')
	monorepo.tsconfig!.file.addOverride(`compilerOptions.paths.${projName}`, [
		relPath,
	])
})

monorepo.synth()
