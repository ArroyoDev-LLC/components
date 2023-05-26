import {
	mergeObjectLiteral,
	type ObjectLiteralMergeSchema,
} from '@arroyodev-llc/utils.projen'
import { DependencyType } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	type ImportDeclarationStructure,
	type ObjectLiteralExpression,
	type OptionalKind,
	type SourceFile,
	SyntaxKind,
	type WriterFunction,
} from 'ts-morph'
import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileOptions,
	type TypeScriptSourceFileTransform,
} from './typescript-source-file'

export interface TypeScriptSourceConfigOptions<ConfigT = Record<string, any>>
	extends TypeScriptSourceFileOptions {
	config?: ConfigT
	pluginsProperty?: string
}

export interface TypeScriptSourceConfigPlugin<OptionsT = Record<string, any>> {
	/**
	 * Plugin name.
	 */
	name: string
	/**
	 * Plugin import.
	 */
	moduleImport: OptionalKind<ImportDeclarationStructure>
	/**
	 * Plugin definition specification.
	 * Defaults to `<name>(<options>)`.
	 */
	spec?: WriterFunction | readonly (string | WriterFunction)[]
	/**
	 * Plugin options.
	 */
	options?: OptionsT
}

export class TypeScriptSourceConfig<
	T extends Record<string, any>
> extends TypeScriptSourceFile {
	constructor(
		project: TypeScriptProject,
		filePath: string,
		public readonly options: TypeScriptSourceConfigOptions<T>
	) {
		const { config, pluginsProperty, ...rest } = options
		super(project, filePath, rest)
		if (config) {
			this.addConfig(config)
		}
	}

	/**
	 * Merge configuration.
	 * @param config
	 */
	addConfig(config: ObjectLiteralMergeSchema<T>): this {
		this.addConfigTransform((configExpr) => {
			mergeObjectLiteral(configExpr, config)
		})
		return this
	}

	/**
	 * Add plugin to config.
	 * @param plugin Plugin spec to add.
	 */
	addPlugin(plugin: TypeScriptSourceConfigPlugin): this {
		const { spec, name, moduleImport, options } = plugin
		const pluginSpec =
			spec ??
			((writer) =>
				writer.write(`${name}(${options ? JSON.stringify(options) : ''})`))

		this.project.deps.addDependency(
			moduleImport.moduleSpecifier,
			DependencyType.RUNTIME
		)
		this.addImport(moduleImport)
		this.addConfigTransform((configExpr) => {
			const existsPlugins = this.getOrCreatePropertyAssignmentInitializer(
				configExpr,
				this.options.pluginsProperty ?? 'plugins',
				SyntaxKind.ArrayLiteralExpression
			)
			existsPlugins.addElements(pluginSpec)
		})
		return this
	}

	/**
	 * Transform config.
	 * @param transform Transformation to apply.
	 */
	addConfigTransform(
		transform: (
			configObjectLiteral: ObjectLiteralExpression,
			sourceFile: SourceFile
		) => void
	) {
		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			const configExport = this.getDefaultExport(
				src,
				SyntaxKind.ObjectLiteralExpression
			)
			transform(configExport, src)
		}
		this.addTransformer(transformer)
		return this
	}
}
