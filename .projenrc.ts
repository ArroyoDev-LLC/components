import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { Vitest } from '@arroyodev-llc/projen.component.vitest'
import { TypescriptBaseBuilder } from '@arroyodev-llc/projen.project.typescript'
import { VueComponentBaseBuilder } from '@arroyodev-llc/projen.project.vue-component'
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
	typescriptVersion: '~5.1',
	pnpmVersion: '8.9.2',
	projenVersion: '0.73.31',
	devDeps: [
		'@aws/pdk',
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
monorepo.package.addPackageResolutions(
	`projen@${monorepo.options.projenVersion!}`,
)

// Builders

const TypescriptOptionsBuilder = new builders.OptionsPropertyBuilder<
	(typeof TypescriptBaseBuilder)['_options']
>()

const CommonDefaultsBuilder = new builders.DefaultOptionsBuilder<{
	parent?: typeof monorepo
	defaultReleaseBranch?: string
	typescriptVersion?: string
}>({
	parent: monorepo,
	defaultReleaseBranch: 'main',
	typescriptVersion: '~5.1',
})
const NameSchemeBuilder = new builders.NameSchemeBuilder({
	scope: '@arroyodev-llc',
})

const BaseTypescriptProjectBuilder = TypescriptBaseBuilder.add(
	CommonDefaultsBuilder,
	{ prepend: true },
).add(NameSchemeBuilder)

const TypescriptProjectBuilder = BaseTypescriptProjectBuilder.add(
	TypescriptOptionsBuilder,
)
const ProjenComponentProjectBuilder = BaseTypescriptProjectBuilder.add(
	new builders.DefaultOptionsBuilder({
		peerDeps: ['projen'],
	}),
).add(TypescriptOptionsBuilder)

const VueComponentProjectBuilder = VueComponentBaseBuilder.add(
	CommonDefaultsBuilder,
	{ prepend: true },
).add(NameSchemeBuilder)

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
		'type-fest@^4',
		'@sindresorhus/is',
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
	deps: ['@sindresorhus/is', 'projen', 'type-fest@^4', 'defu', 'flat'],
	devDeps: ['@types/flat'],
})
new Vitest(utilsProjen)

const utilsProjenBuilder = TypescriptProjectBuilder.build({
	name: 'utils.projen-builder',
	workspaceDeps: [utilsProjen],
	deps: ['projen', 'type-fest@^4'],
})
new Vitest(utilsProjenBuilder)

const utilsUnbuildCompositePreset = TypescriptProjectBuilder.build({
	name: 'utils.unbuild-composite-preset',
	peerDeps: ['unbuild'],
	unbuildCompositePreset: false,
})
// the preset uses itself to build itself.
utilsUnbuildCompositePreset
	.unbuild!.file.addImport({
		moduleSpecifier: './src',
		namedImports: ['compositePreset'],
	})
	.addConfig({
		preset: (writer) => writer.write('compositePreset()'),
	})

/**
 * Projen Components
 */
const lintingComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.linting',
	deps: ['p-queue', 'shell-quote'],
	devDeps: ['@types/shell-quote'],
	workspaceDeps: [utilsProjen],
})

const gitHooksComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.git-hooks',
	peerDeps: ['lint-staged', 'simple-git-hooks'],
})

const tsSourceComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.typescript-source-file',
	workspaceDeps: [utilsProjen, lintingComponent, utilsFs, utilsTsAst],
	peerDeps: ['@aws/pdk'],
	deps: ['ts-morph'],
})

const pnpmWorkspaceComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.pnpm-workspace',
	workspaceDeps: [utilsProjen],
})

const unbuildComponent = ProjenComponentProjectBuilder.build({
	name: 'projen.component.unbuild',
	workspaceDeps: [utilsProjen, tsSourceComponent, utilsTsAst],
	peerDeps: ['@aws/pdk'],
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
	peerDeps: ['projen', '@aws/pdk'],
})
LintConfig.of(nxMonorepoProject)!.eslint.addIgnorePattern(
	'src/nx-monorepo-project-options.ts',
)

const typescriptProject = ProjenComponentProjectBuilder.build({
	name: 'projen.project.typescript',
	deps: ['type-fest@^4'],
	peerDeps: ['@aws/pdk'],
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
	'src/typescript-project-options.ts',
)
typescriptProject.lintConfig.eslint.addIgnorePattern(
	'src/typescript-config-options.ts',
)
typescriptProject.lintConfig.eslint.addIgnorePattern(
	'src/typescript-compiler-options.ts',
)

const vueComponentProject = ProjenComponentProjectBuilder.build({
	name: 'projen.project.vue-component',
	workspaceDeps: [
		typescriptProject,
		vueComponent,
		viteComponent,
		utilsProjenBuilder,
	],
})
vueComponentProject.pnpm.addWorkspaceDeps(
	{ depType: DependencyType.PEER, addTsPath: false },
	unbuildComponent,
	pnpmWorkspaceComponent,
	lintingComponent,
)

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
	vueComponentProject,
)

// Vue Components

const text = VueComponentProjectBuilder.build({
	name: 'vue.ui.text',
})
text.lintConfig.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

const button = VueComponentProjectBuilder.build({
	name: 'vue.ui.button',
	workspaceDeps: [text],
	deps: ['primevue'],
})
button.lintConfig.eslint.addRules({
	'vue/multi-word-component-names': ['off'],
})

// adds support for .cts/.mts
monorepo.package.addPackageResolutions('unbuild@2.0.0-rc.0')
monorepo.synth()
