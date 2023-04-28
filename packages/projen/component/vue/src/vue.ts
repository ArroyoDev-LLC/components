import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { TypeScriptSourceFile } from '@arroyodev-llc/projen.component.typescript-source-file'
import { UnBuild } from '@arroyodev-llc/projen.component.unbuild'
import {
	Vitest,
	VitestConfigType,
} from '@arroyodev-llc/projen.component.vitest'
import { applyOverrides } from '@arroyodev-llc/utils.projen'
import { Component, DependencyType } from 'projen'
import { type TypescriptConfig } from 'projen/lib/javascript'
import { type TypeScriptProject } from 'projen/lib/typescript'
import { SyntaxKind } from 'ts-morph'

export class Vue extends Component {
	public static of(project: TypeScriptProject): Vue | undefined {
		const isVue = (o: Component): o is Vue => o instanceof Vue
		return project.components.find(isVue)
	}

	constructor(public readonly project: TypeScriptProject) {
		super(project)

		this.applyPackage()
			.applyLintConfig(LintConfig.of(this.project))
			.applyTsShims()
			.applyTsConfig()
			.applyUnBuild(UnBuild.of(this.project))
			.applyVitest(Vitest.of(this.project) ?? this.buildVitest())
	}

	applyPackage(): this {
		this.project.addDeps('vue', '@vue/runtime-dom')
		this.project.addDevDeps('vue-tsc')
		this.project.compileTask.reset('vue-tsc', { args: ['--build'] })
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

	applyTsConfig(): this {
		const tsconfig = this.project.tryFindObjectFile('tsconfig.json')!
		const tsconfigDev = this.project.tryFindObjectFile('tsconfig.dev.json')
		const includes = [
			'include',
			'*.d.ts',
			`${this.project.srcdir}/*.tsx`,
			`${this.project.srcdir}/**/*.tsx`,
			`${this.project.srcdir}/*.vue`,
			`${this.project.srcdir}/**/*.vue`,
		]
		tsconfig.addToArray('include', ...includes)
		tsconfigDev?.addToArray?.('include', ...includes)
		return this
	}

	applyLintConfig(component?: LintConfig): this {
		if (!component) return this
		this.project.addDevDeps('eslint-plugin-vue')
		component.eslint.addPlugins('eslint-plugin-vue')
		component.eslint.addExtends('plugin:vue/vue3-recommended')
		component.eslint.addOverride({
			files: ['*.vue', '**/*.vue'],
			rules: {
				'vue/html-indent': ['off'],
			},
		})
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
		this.project.compileTask.exec('unbuild')
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

	buildVitest(): Vitest {
		return new Vitest(this.project, {
			configType: VitestConfigType.PROJECT,
			settings: {
				test: {
					name: this.project.name,
					environment: 'happy-dom',
					include: [`${this.project.testdir}/\*\*/\*.spec.ts`],
				},
			},
		})
	}

	applyVitest(component?: Vitest): this {
		if (!component) return this
		this.project.addDevDeps(
			'@vitejs/plugin-vue',
			'happy-dom',
			'@vue/test-utils',
			'faker'
		)
		component.configFile.addImport({
			moduleSpecifier: '@vitejs/plugin-vue',
			defaultImport: 'vue',
		})
		component.addConfigTransform((configExpr) => {
			configExpr.addPropertyAssignment({
				name: 'plugins',
				initializer: '[vue()]',
			})
		})
		this.project.tasks
			.tryFind('test')
			?.reset?.('vitest', { args: ['--run'], receiveArgs: true })
		return this
	}
}
