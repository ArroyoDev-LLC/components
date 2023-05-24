import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import {
	addPropertyAssignmentsFromObject,
	findComponent,
} from '@arroyodev-llc/utils.projen'
import { Component, DependencyType, type Project } from 'projen'
import { type NodePackage } from 'projen/lib/javascript'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	type ImportDeclarationStructure,
	type ObjectLiteralExpression,
	type OptionalKind,
	type SourceFile,
	SyntaxKind,
	type WriterFunction,
} from 'ts-morph'
import type { UserConfigExport } from 'vite'

export interface ViteOptionsPlugin<OptionsT = Record<string, any>> {
	/**
	 * Name of plugin.
	 * This should match the import name from `moduleImport`.
	 */
	name: string
	/**
	 * Module import specification.
	 */
	moduleImport: OptionalKind<ImportDeclarationStructure>
	/**
	 * Plugin definition specification.
	 * Defaults to `<name>(<options>)`.
	 */
	spec?: WriterFunction | readonly (string | WriterFunction)[]
	/**
	 * Options object for plugin.
	 */
	options?: OptionsT
}

export interface ViteOptions {
	build: UserConfigExport
	plugins?: ViteOptionsPlugin[]
}

export class Vite extends Component {
	public static of(project: Project): Vite | undefined {
		return findComponent<typeof Vite>(project, Vite)
	}

	readonly file: TypeScriptSourceFile

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options?: ViteOptions
	) {
		super(project)
		this.options = options ?? { build: {} }

		this.applyPackage(this.project.package)
		this.file = this.buildFile()
		this.addBuildConfig(this.options.build)
		this.project.tasks
			.tryFind('post-compile')
			?.exec?.('vite', { args: ['build'] })
		this.project
			.tryFindObjectFile('tsconfig.json')
			?.addToArray?.('compilerOptions.types', 'vite/client')
	}

	protected applyPackage(nodePackage: NodePackage): this {
		nodePackage.project.deps.addDependency('vite', DependencyType.BUILD)
		return this
	}

	protected buildFile(): TypeScriptSourceFile {
		const file = new TypeScriptSourceFile(this.project, 'vite.config.ts', {
			source: `export default defineConfig({})`,
			recreate: true,
		})
		file.addImport({
			moduleSpecifier: 'vite',
			namedImports: ['defineConfig'],
		})
		LintConfig.of(this.project)?.eslint?.addOverride?.({
			files: ['vite.config.ts'],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		})
		return file
	}

	/**
	 * Add Vite plugin to config.
	 * @param plugin Plugin specification.
	 */
	addPlugin(plugin: ViteOptionsPlugin): this {
		const { spec, name, moduleImport, options } = plugin
		const pluginSpec =
			spec ??
			((writer) =>
				writer.write(`${name}(${options ? JSON.stringify(options) : ''})`))

		this.project.deps.addDependency(
			moduleImport.moduleSpecifier.split('/')[0],
			DependencyType.BUILD
		)
		this.file.addImport(moduleImport)
		this.addConfigTransform((configExpr) => {
			const existsPlugins = configExpr
				.getProperty('plugins')
				?.asKind?.(SyntaxKind.PropertyAssignment)
			const pluginsExpr =
				existsPlugins?.asKindOrThrow(SyntaxKind.PropertyAssignment) ??
				configExpr.addPropertyAssignment({
					name: 'plugins',
					initializer: '[]',
				})
			pluginsExpr
				.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
				.addElements(pluginSpec)
		})
		return this
	}

	/**
	 * Add build config. Will be merged into existing.
	 * @param config Config to merge.
	 */
	addBuildConfig(config: UserConfigExport): this {
		this.addConfigTransform((configExpr) => {
			addPropertyAssignmentsFromObject(configExpr, config)
		})
		return this
	}

	/**
	 * Add `ts-morph` transformation on config node.
	 * @param transform Transformation to add.
	 */
	addConfigTransform(
		transform: (
			configObjectLiteral: ObjectLiteralExpression,
			sourceFile: SourceFile
		) => void
	): this {
		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			const configExport = src
				.getExportAssignmentOrThrow((exp) =>
					Boolean(exp.getExpressionIfKind(SyntaxKind.CallExpression))
				)
				.getExpressionIfKindOrThrow(SyntaxKind.CallExpression)
			const configExpr = configExport
				.getArguments()[0]!
				.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
			transform(configExpr, src)
		}
		this.file.addTransformer(transformer)
		return this
	}
}
