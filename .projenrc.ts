import * as nx_monorepo from '@aws-prototyping-sdk/nx-monorepo'
import { javascript, JsonFile, LogLevel, github } from 'projen'
import { TypeScriptModuleResolution } from 'projen/lib/javascript'
import LintConfig from './projenrc/lint-config'
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
	],
})
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

const inputField = new VueComponent({
	parent: monorepo,
	name: 'vue.ui.inputField',
	deps: ['primevue', text.package.packageName],
})
LintConfig.of(inputField)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})
const timer = new VueComponent({
	parent: monorepo,
	name: 'vue.ui.timer',
})
LintConfig.of(timer)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})
monorepo.synth()
