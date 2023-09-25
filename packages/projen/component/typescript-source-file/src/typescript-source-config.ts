import {
	mergeObjectLiteral,
	type ObjectLiteralMergeSchema,
} from '@arroyodev-llc/utils.ts-ast'
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
	/**
	 * Config spec for current component.
	 */
	config?: ConfigT
	/**
	 * Generic plugins property name.
	 */
	pluginsProperty?: string
	/**
	 * Resolver for config object expression.
	 * @param source Current {@link ts-morph#SourceFile}
	 */
	configResolver?: (
		tsConfig: TypeScriptSourceConfig,
		source: SourceFile,
	) => ObjectLiteralExpression
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
	/**
	 * Dependency type to add for plugin.
	 * @default {@link DependencyType.BUILD}
	 */
	dependencyType?: DependencyType
}

export class TypeScriptSourceConfig<
	T extends Record<string, any> = Record<string, any>,
> extends TypeScriptSourceFile {
	/**
	 * Create config with call expression config resolver.
	 * @param project Project to add config to.
	 * @param filePath Path to config file.
	 * @param options Config options.
	 */
	static withCallExpressionConfig<
		ET extends Record<string, any> = Record<string, any>,
	>(
		project: TypeScriptProject,
		filePath: string,
		options: TypeScriptSourceConfigOptions<ET>,
	): TypeScriptSourceConfig<ET> {
		return new TypeScriptSourceConfig<ET>(project, filePath, {
			...options,
			configResolver: (cfg, src) =>
				cfg
					.getDefaultExport(src, SyntaxKind.CallExpression)
					.getArguments()[0]!
					.asKindOrThrow(SyntaxKind.ObjectLiteralExpression),
		})
	}

	declare __mergeSchema: ObjectLiteralMergeSchema<T>
	declare __pluginSchema: TypeScriptSourceConfigPlugin<T>

	constructor(
		project: TypeScriptProject,
		filePath: string,
		public readonly options: TypeScriptSourceConfigOptions<T>,
	) {
		const { config, ...rest } = options
		super(project, filePath, rest)
		if (config) {
			this.addConfig(config)
		}
	}

	/**
	 * Merge configuration.
	 * @param config
	 */
	addConfig<ConfigT extends ObjectLiteralMergeSchema<T>>(
		config: ConfigT,
	): this {
		this.addConfigTransform((configExpr) => {
			mergeObjectLiteral(configExpr, config)
		})
		return this
	}

	/**
	 * Add plugin to config.
	 * @param plugin Plugin spec to add.
	 */
	addPlugin<PluginT>(plugin: TypeScriptSourceConfigPlugin<PluginT>): this {
		const { spec, name, moduleImport, options, dependencyType } = plugin
		const pluginSpec =
			spec ??
			((writer) =>
				writer.write(`${name}(${options ? JSON.stringify(options) : ''})`))
		const moduleSpecParts = moduleImport.moduleSpecifier.split('/')
		const depName = (
			moduleImport.moduleSpecifier.startsWith('@')
				? // @scope/package[/export] -> @scope/package
				  moduleSpecParts.slice(0, 2)
				: // package[/export] -> package
				  moduleSpecParts.slice(0, 1)
		).join('/')
		this.project.deps.addDependency(
			depName,
			dependencyType ?? DependencyType.BUILD,
		)
		this.addImport(moduleImport)
		this.addConfigTransform((configExpr) => {
			const existsPlugins = this.getOrCreatePropertyAssignmentInitializer(
				configExpr,
				this.options.pluginsProperty ?? 'plugins',
				SyntaxKind.ArrayLiteralExpression,
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
			sourceFile: SourceFile,
		) => void,
	) {
		const configResolver =
			this.options.configResolver ??
			((_, src: SourceFile) => {
				return this.getDefaultExport(src, SyntaxKind.ObjectLiteralExpression)
			})

		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			transform(configResolver(this, src), src)
		}
		this.addTransformer(transformer)
		return this
	}
}
