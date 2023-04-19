import { Component, DependencyType, javascript, typescript } from 'projen'
import {
	TypescriptConfig,
	TypescriptConfigExtends,
	TypescriptConfigOptions,
	TypeScriptModuleResolution,
} from 'projen/lib/javascript'
import {
	TypeScriptProject,
	TypeScriptProjectOptions,
} from 'projen/lib/typescript'
import { SyntaxKind } from 'ts-morph'
import LintConfig from './lint-config.ts'
import { TypeScriptSourceFile } from './typescript-source-file.ts'
import { UnBuild } from './unbuild.ts'
import { applyOverrides } from './utils.ts'

const vueTsConfig: TypescriptConfigOptions = {
	compilerOptions: {
		skipLibCheck: true,
		moduleResolution: TypeScriptModuleResolution.BUNDLER,
		emitDeclarationOnly: true,
		allowImportingTsExtensions: true,
		allowArbitraryExtensions: true,
		verbatimModuleSyntax: true,
		module: 'ESNext',
		target: 'ESNext',
		lib: ['ESNext', 'DOM'],
	},
}

interface VueComponentOptions
	extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch'> {
	defaultReleaseBranch?: string
}

export class Vue extends Component {
	public static of(project: TypeScriptProject): Vue | undefined {
		const isVue = (o: Component): o is Vue => o instanceof Vue
		return project.components.find(isVue)
	}

	tsconfigDev!: TypescriptConfig

	constructor(public readonly project: TypeScriptProject) {
		super(project)

		this.applyPackage()
			.applyLintConfig(LintConfig.of(this.project))
			.applyTsShims()
			.applyTsConfig(this.project.tsconfig)
			.applyUnBuild(UnBuild.of(this.project))
	}

	applyPackage(): this {
		this.project.addDeps('vue', '@vue/runtime-dom')
		return this
	}

	applyTsShims(): this {
		const source = [
			`declare module "*.vue" {`,
			`	import { DefineComponent } from "vue"`,
			`	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types`,
			`	const component: DefineComponent<{}, {}, any>`,
			`	export default component`,
			`}`,
		]
		new TypeScriptSourceFile(this.project, 'env.d.ts', {
			source: source.join('\n'),
		})
		return this
	}

	applyTsConfig(tsconfig?: TypescriptConfig): this {
		if (!tsconfig) return this
		tsconfig.addInclude('*.d.ts')
		tsconfig.addInclude(`${this.project.srcdir}/*.vue`)
		tsconfig.addInclude(`${this.project.srcdir}/**/*.vue`)
		applyOverrides(tsconfig.file, vueTsConfig)
		const devFiles = {
			include: this.project.tsconfigDev.include.slice(),
			exclude: this.project.tsconfigDev.exclude.slice(),
		}
		this.project.tryRemoveFile('tsconfig.dev.json')
		const uniqArray = (array: string[]) => Array.from(new Set(array))
		this.tsconfigDev = new TypescriptConfig(this.project, {
			fileName: 'tsconfig.dev.json',
			extends: TypescriptConfigExtends.fromTypescriptConfigs([tsconfig]),
			exclude: uniqArray([...devFiles.exclude, 'node_modules']),
			include: uniqArray([
				...tsconfig.include,
				...devFiles.include,
				'build.config.json',
				'test/*.ts',
			]),
			compilerOptions: {},
		})
		return this
	}

	applyLintConfig(component?: LintConfig): this {
		if (!component) return this
		this.project.addDevDeps('eslint-plugin-vue')
		component.eslint.addPlugins('eslint-plugin-vue')
		component.eslint.addExtends('plugin:vue/vue3-recommended')
		applyOverrides(component.eslintFile, {
			parser: 'vue-eslint-parser',
			'parserOptions.parser': '@typescript-eslint/parser',
			'parserOptions.extraFileExtensions': ['.vue'],
			'settings.import/parsers.vue-eslint-parser': ['.vue'],
		})
		component.eslint.eslintTask.reset(
			component.eslint.eslintTask.steps[0]!.exec!.replace('.tsx', '.tsx,.vue')
		)
		return this
	}

	applyUnBuild(component?: UnBuild): this {
		if (!component) return this
		this.tsconfigDev.addInclude(component.file.filePath)
		this.project.deps.addDependency('rollup', DependencyType.BUILD)
		this.project.deps.addDependency('rollup-plugin-vue', DependencyType.BUILD)
		component.file.addImport({
			moduleSpecifier: 'rollup-plugin-vue',
			defaultImport: 'vue',
		})
		component.file.addImport({
			moduleSpecifier: 'rollup',
			namedImports: ['RollupOptions'],
			isTypeOnly: true,
		})
		component.addConfigTransform((configExpr) => {
			const existingHooks = configExpr
				.getProperty('hooks')
				?.asKind?.(SyntaxKind.PropertyAssignment)
				?.getInitializer?.()
			const hooksExpr = configExpr.addPropertyAssignment({
				name: 'hooks',
				initializer: existingHooks?.getText?.() ?? '{}',
			})
			const hooksInit = hooksExpr.getInitializerIfKindOrThrow(
				SyntaxKind.ObjectLiteralExpression
			)
			hooksInit.addMethod({
				name: "'rollup:options'",
				parameters: [
					{ name: '_', type: 'BuildContext' },
					{ name: 'options', type: 'RollupOptions' },
				],
				statements: [
					`// @ts-expect-error ignore rollup options.`,
					`options.plugins.push(vue())`,
				],
			})
		})
		return this
	}
}

export class VueComponent extends typescript.TypeScriptProject {
	constructor(options: VueComponentOptions) {
		const { name } = options
		const namePath = name.split('.').join('/')
		const defaultOutDir = `packages/${namePath}`
		const defaultPackageName = `@arroyodev-llc/components.${name}`
		super({
			defaultReleaseBranch: 'main',
			packageManager: javascript.NodePackageManager.PNPM,
			pnpmVersion: '8',
			outdir: defaultOutDir,
			packageName: defaultPackageName,
			jest: false,
			projenDevDependency: false,
			libdir: 'dist',
			entrypoint: 'dist/index.mjs',
			entrypointTypes: 'dist/index.d.ts',
			typescriptVersion: '^5',
			...options,
		})
		new LintConfig(this)
		new UnBuild(this, {
			options: { name: defaultPackageName, declaration: true },
		})

		this.tasks.removeTask('build')
		this.tasks.addTask('build', { exec: 'unbuild' })
		this.tasks.tryFind('test')!.reset('vitest', { args: ['--run'] })

		new Vue(this)
	}
}
