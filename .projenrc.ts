import * as nx_monorepo from "@aws-prototyping-sdk/nx-monorepo";
import { DependencyType, javascript, LogLevel, TextFile, typescript } from "projen";
import { type TypescriptConfigOptions, TypeScriptModuleResolution } from "projen/lib/javascript";
import { TypeScriptProjectOptions } from "projen/lib/typescript";
import LintConfig from "./projenrc/lint-config";
import { UnBuild } from "./projenrc/unbuild";

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
	github: false,
	projenCommand: nx_monorepo.buildExecutableCommand(
		javascript.NodePackageManager.PNPM,
		'projen'
	),
	prettier: true,
	projenrcTs: true,
	renovatebot: true,
	gitignore: ['/.idea', '.idea'],
	workspaceConfig: {
		linkLocalWorkspaceBins: true,
	},
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

const vueTsConfig: TypescriptConfigOptions = {
	compilerOptions: {
		skipLibCheck: true,
		moduleResolution: TypeScriptModuleResolution.BUNDLER,
		allowImportingTsExtensions: true,
		allowArbitraryExtensions: true,
		verbatimModuleSyntax: true,
		module: 'ESNext',
		target: 'ESNext',
		lib: ['ESNext', 'DOM'],
	},
}

interface VueComponentProjectOptions
	extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch'> {
	defaultReleaseBranch?: string
}

class VueComponentProject extends typescript.TypeScriptProject {
	constructor(options: VueComponentProjectOptions) {
		const { name } = options
		const namePath = name.split('.').join('/')
		const defaultOutDir = `packages/${namePath}`
		const defaultPackageName = `@arroyodev-llc/components.${name}`
		super({
			defaultReleaseBranch: 'main',
			tsconfig: vueTsConfig,
			packageManager: javascript.NodePackageManager.PNPM,
			pnpmVersion: '8',
			outdir: defaultOutDir,
			packageName: defaultPackageName,
			jest: false,
			projenDevDependency: false,
			libdir: 'dist',
			entrypoint: 'dist/index.mjs',
			entrypointTypes: 'dist/index.d.ts',
			...options,
		})

		new LintConfig(this, { vue: true })

		new UnBuild(this, {
			vue: true,
			options: { name: defaultPackageName, declaration: true },
		})
		new TextFile(this, 'env.d.ts', {
			readonly: true,
			marker: true,
			lines: `declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}`.split('\n'),
		})

		this.addDeps('vue', '@vue/runtime-dom')
		this.addDevDeps('typescript', 'vitest')

		this.deps.addDependency('eslint-plugin-vue', DependencyType.DEVENV)
		this.eslint!.addPlugins('eslint-plugin-vue')
		this.eslint!.config.parserOptions.extraFileExtensions = ['.vue']
		this.eslint!.ignorePatterns.push('build.config.ts')

		this.tsconfig!.addInclude('env.d.ts')
		this.tsconfig!.addInclude('src/**/*.vue')
		this.tsconfigDev!.addExclude('build.config.ts')
		this.tsconfigDev!.addInclude('src/**/*.vue')
		this.tasks.removeTask('build')
		this.tasks.addTask('build', { exec: 'unbuild' })
	}
}

const text = new VueComponentProject({
	parent: monorepo,
	name: 'vue.ui.text',
})
LintConfig.of(text)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

const button = new VueComponentProject({
	parent: monorepo,
	name: 'vue.ui.button',
	deps: ['primevue', text.package.packageName],
})
LintConfig.of(button)!.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

monorepo.synth()
